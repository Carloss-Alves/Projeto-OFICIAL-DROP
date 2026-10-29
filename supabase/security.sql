-- ============================================================================
-- DROP BSB — Proteção contra força bruta no login do Admin
--
-- Esta camada é aplicada de duas formas, combinadas:
--
-- 1) supabase/functions/admin-login (Edge Function): o navegador chama ESSA
--    função em vez de supabase.auth.signInWithPassword() diretamente. É a
--    função quem decide, no servidor, se a tentativa de autenticação chega
--    até o Supabase Auth — fechando a lacuna de um cliente malicioso pular
--    a checagem de bloqueio chamando a API de Auth direto pelo navegador.
--
-- 2) O rate limiting nativo do Supabase Auth continua ativo por baixo de
--    tudo isso, como uma segunda camada sempre presente, mesmo se a Edge
--    Function não estiver implantada ainda (ver AdminAuthContext.tsx: há um
--    fallback client-side que chama estas mesmas RPCs diretamente quando a
--    Edge Function não responde, para não deixar o Admin inacessível antes
--    do deploy — nesse modo de fallback a proteção é best-effort, igual à
--    versão anterior, e só fecha de vez com a Edge Function implantada).
--
-- O bloqueio combina DOIS sinais independentes — conta (e-mail) e origem
-- (IP, pseudonimizado com hash+salt, nunca gravado em texto puro) — porque
-- nenhum dos dois sozinho é confiável: um IP pode ser compartilhado
-- (Wi-Fi público, CGNAT, empresa) e um e-mail pode ser adivinhado em spray
-- attack vindo de várias contas na mesma origem. Basta QUALQUER um dos dois
-- estar bloqueado para barrar a tentativa.
-- ============================================================================

create table if not exists login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  failed_count integer not null default 0,
  blocked_until timestamptz,
  last_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists idx_login_attempts_email on login_attempts (lower(email));

create table if not exists login_attempts_ip (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  failed_count integer not null default 0,
  blocked_until timestamptz,
  last_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists idx_login_attempts_ip on login_attempts_ip (ip_hash);

alter table login_attempts enable row level security;
alter table login_attempts_ip enable row level security;
-- Nenhuma policy = nenhum acesso direto pelo cliente, nem autenticado.
-- Só as RPCs abaixo (SECURITY DEFINER) leem/escrevem estas tabelas.

-- Migração idempotente: se você já tinha a versão anterior deste arquivo
-- (só por e-mail) aplicada no seu projeto, isto garante que a tabela nova
-- (login_attempts_ip) seja criada sem precisar recriar nada existente.

-- Migração idempotente: se você já tinha a versão anterior deste arquivo
-- (só por e-mail, com assinaturas de 1/2 argumentos) aplicada no seu
-- projeto, removemos as assinaturas antigas antes de criar as novas — do
-- contrário o Postgres manteria as duas versões como overloads distintos,
-- o que pode gerar ambiguidade na hora de chamar a função pelo cliente.
drop function if exists check_login_blocked(text);
drop function if exists register_login_attempt(text, boolean);

-- Checagem somente-leitura de bloqueio (por e-mail OU por IP), sem registrar
-- tentativa — usada ANTES do login real. p_ip_hash é opcional (default null)
-- para manter compatível o fallback client-side, que não tem como obter o IP
-- real do navegador de forma confiável (só a Edge Function consegue, via
-- cabeçalho x-forwarded-for do lado do servidor).
create or replace function check_login_blocked(p_email text, p_ip_hash text default null)
returns table(blocked boolean, wait_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_blocked_until timestamptz;
  v_ip_blocked_until timestamptz;
  v_max_until timestamptz;
begin
  select blocked_until into v_email_blocked_until from login_attempts where lower(email) = lower(p_email);

  if p_ip_hash is not null then
    select blocked_until into v_ip_blocked_until from login_attempts_ip where ip_hash = p_ip_hash;
  end if;

  v_max_until := greatest(coalesce(v_email_blocked_until, 'epoch'::timestamptz), coalesce(v_ip_blocked_until, 'epoch'::timestamptz));

  if v_max_until > now() then
    return query select true, ceil(extract(epoch from (v_max_until - now())))::integer;
  else
    return query select false, 0;
  end if;
end;
$$;
grant execute on function check_login_blocked(text, text) to anon, authenticated;

-- Registra o resultado de uma tentativa (por e-mail E por IP quando informado).
-- Sucesso zera os dois contadores; falha incrementa os dois e pode bloquear
-- qualquer um deles de forma independente (bloqueio progressivo: 3 -> 5min,
-- 6 -> 15min, 9+ -> 1h). Nunca gera banimento permanente automático.
create or replace function register_login_attempt(p_email text, p_success boolean, p_ip_hash text default null)
returns table(blocked boolean, wait_seconds integer, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_row login_attempts%rowtype;
  v_ip_row login_attempts_ip%rowtype;
  v_now timestamptz := now();
  v_email_lock_minutes integer := 0;
  v_ip_lock_minutes integer := 0;
  v_wait_seconds integer := 0;
begin
  -- ---- linha por e-mail ----
  select * into v_email_row from login_attempts where lower(email) = lower(p_email) for update;
  if v_email_row.id is null then
    insert into login_attempts (email, failed_count, last_attempt_at)
    values (p_email, 0, v_now)
    returning * into v_email_row;
  end if;

  if p_success then
    update login_attempts set failed_count = 0, blocked_until = null, last_attempt_at = v_now where id = v_email_row.id;
  elsif v_email_row.blocked_until is null or v_email_row.blocked_until <= v_now then
    v_email_row.failed_count := v_email_row.failed_count + 1;
    v_email_lock_minutes := case
      when v_email_row.failed_count >= 9 then 60
      when v_email_row.failed_count >= 6 then 15
      when v_email_row.failed_count >= 3 then 5
      else 0
    end;
    update login_attempts set
      failed_count = v_email_row.failed_count,
      last_attempt_at = v_now,
      blocked_until = case when v_email_lock_minutes > 0 then v_now + make_interval(mins => v_email_lock_minutes) else null end
    where id = v_email_row.id;
  end if;

  -- ---- linha por IP (só se um hash foi informado — ou seja, só quando a
  -- chamada vem da Edge Function, que é quem tem acesso ao IP real) ----
  if p_ip_hash is not null then
    select * into v_ip_row from login_attempts_ip where ip_hash = p_ip_hash for update;
    if v_ip_row.id is null then
      insert into login_attempts_ip (ip_hash, failed_count, last_attempt_at)
      values (p_ip_hash, 0, v_now)
      returning * into v_ip_row;
    end if;

    if p_success then
      update login_attempts_ip set failed_count = 0, blocked_until = null, last_attempt_at = v_now where id = v_ip_row.id;
    elsif v_ip_row.blocked_until is null or v_ip_row.blocked_until <= v_now then
      v_ip_row.failed_count := v_ip_row.failed_count + 1;
      -- Um IP tentando várias contas (spray attack) deve travar mais rápido
      -- que uma conta isolada sendo tentada de lugares diferentes.
      v_ip_lock_minutes := case
        when v_ip_row.failed_count >= 15 then 60
        when v_ip_row.failed_count >= 8 then 15
        when v_ip_row.failed_count >= 5 then 5
        else 0
      end;
      update login_attempts_ip set
        failed_count = v_ip_row.failed_count,
        last_attempt_at = v_now,
        blocked_until = case when v_ip_lock_minutes > 0 then v_now + make_interval(mins => v_ip_lock_minutes) else null end
      where id = v_ip_row.id;
    end if;
  end if;

  if p_success then
    return query select false, 0, 'ok';
    return;
  end if;

  v_wait_seconds := greatest(v_email_lock_minutes, v_ip_lock_minutes) * 60;

  if v_wait_seconds > 0 then
    return query select true, v_wait_seconds,
      format('Muitas tentativas. Tente novamente em %s minutos.', greatest(v_email_lock_minutes, v_ip_lock_minutes));
  else
    return query select false, 0, 'Email ou senha inválidos.';
  end if;
end;
$$;

-- Permite que QUALQUER pessoa (mesmo não autenticada) chame a função — ela
-- precisa funcionar antes do login. Nunca revela se o e-mail existe, nunca
-- expõe as tabelas subjacentes. Em produção, prefira chamar isso só de
-- dentro da Edge Function (com a service_role, que já ignora RLS) — o grant
-- para anon/authenticated abaixo existe para manter o fallback client-side
-- funcionando enquanto você não fizer o deploy da função.
grant execute on function register_login_attempt(text, boolean, text) to anon, authenticated;

-- Limpeza opcional: linhas antigas sem bloqueio ativo e sem tentativa recente
-- podem ser removidas periodicamente (ex: via pg_cron, se disponível no seu plano).
-- delete from login_attempts where blocked_until is null and last_attempt_at < now() - interval '30 days';
-- delete from login_attempts_ip where blocked_until is null and last_attempt_at < now() - interval '30 days';

-- ============================================================================
-- Estoque — decremento atômico (pronto para quando houver checkout real)
--
-- NOTA IMPORTANTE sobre o modelo atual: o checkout da DROP BSB é
-- Carrinho → WhatsApp — a venda é confirmada manualmente na conversa, e o
-- vendedor ajusta o estoque pelo /admin/estoque depois de confirmar o
-- pagamento. Não existe um "botão de compra" atômico no app hoje, então
-- decrementar estoque automaticamente ao simplesmente abrir o WhatsApp
-- estaria errado — o cliente pode nem fechar a compra. Por isso esta função
-- NÃO é chamada em lugar nenhum do fluxo atual.
--
-- Ela existe pronta para o dia em que você integrar Mercado Pago, Stripe ou
-- Pix (ver seção "Formas de pagamento futuras" do README): nesse momento, o
-- passo que confirma o pagamento deve chamar esta RPC para cada item do
-- pedido, o que evita a condição de corrida clássica de dois clientes
-- comprando a última unidade ao mesmo tempo (o `where stock >= p_quantity`
-- garante que só um dos dois consiga decrementar com sucesso).
-- ============================================================================
create or replace function decrement_stock_safe(p_variant_id uuid, p_quantity integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  update product_variants
    set stock = stock - p_quantity
    where id = p_variant_id and stock >= p_quantity;
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;
-- Restrita a admin/lógica de servidor por enquanto — sem grant para anon/authenticated.
-- Quando integrar o gateway de pagamento, decida ali se a confirmação roda como
-- usuário admin (já autorizado) ou via Edge Function com service_role.
