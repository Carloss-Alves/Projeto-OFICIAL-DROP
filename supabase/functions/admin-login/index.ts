// ============================================================================
// DROP BSB — Edge Function: admin-login
//
// Proxy de login do Admin. O navegador NUNCA chama supabase.auth
// .signInWithPassword() diretamente para o login administrativo — ele chama
// esta função, que roda no servidor (Deno, isolado do navegador) e é o único
// lugar do projeto que tem acesso à SERVICE_ROLE_KEY. Isso fecha a lacuna que
// existia antes: um cliente malicioso não pode mais pular a checagem de
// bloqueio simplesmente chamando a API de Auth direto, porque agora é esta
// função — não o navegador — quem decide se a tentativa de autenticação
// chega até o Supabase Auth.
//
// Fluxo:
//   Frontend -> admin-login -> checa bloqueio (email + IP) -> tenta Auth
//            -> registra resultado (sucesso zera contador, falha incrementa)
//            -> devolve access_token/refresh_token (nunca a service_role_key)
//
// Deploy (depende do Supabase CLI + projeto vinculado — configuração externa,
// não simulável neste ambiente):
//   supabase functions deploy admin-login
//
// Secrets necessários (Project Settings -> Edge Functions -> Secrets, ou via
// `supabase secrets set`):
//   SUPABASE_URL              (já disponível automaticamente no runtime)
//   SUPABASE_ANON_KEY         (já disponível automaticamente no runtime)
//   SUPABASE_SERVICE_ROLE_KEY (já disponível automaticamente no runtime)
//   IP_HASH_SALT              valor aleatório próprio, ex: gerado com
//                              `openssl rand -hex 32` — usado só para
//                              pseudonimizar o IP antes de gravar no banco
//                              (nunca gravamos o IP em texto puro).
//   ADMIN_ALLOWED_ORIGIN       opcional — restringe CORS a um único domínio
//                              (ex: https://dropbsb.com.br). Sem essa variável,
//                              a função reflete a origem da própria requisição
//                              (funciona, mas é menos restritivo — recomendado
//                              configurar em produção).
// ============================================================================

// @ts-nocheck — arquivo roda no runtime Deno do Supabase Edge Functions, não
// no bundler/TypeScript do projeto Vite. As diretivas abaixo evitam que o
// `tsc` do frontend tente (e falhe ao) checar tipos de módulos remotos Deno.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const ALLOWED_ORIGIN = Deno.env.get('ADMIN_ALLOWED_ORIGIN'); // ex: https://dropbsb.com.br — configure no deploy

function corsHeaders(origin: string | null) {
  // Restringe a origem quando ADMIN_ALLOWED_ORIGIN estiver configurado (recomendado
  // em produção — Seção 62: não usar Access-Control-Allow-Origin: '*' em endpoint
  // sensível sem necessidade). Sem essa variável, libera qualquer origem para não
  // travar o login durante o desenvolvimento/antes de você definir o domínio final.
  const allowOrigin = ALLOWED_ORIGIN ?? origin ?? '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getClientIp(req: Request): string {
  // Supabase Edge Functions (Deno Deploy) preenchem x-forwarded-for com o IP real do cliente.
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip') ?? 'unknown';
}

Deno.serve(async (req: Request) => {
  const headers = corsHeaders(req.headers.get('origin'));
  const jsonResponse = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const IP_SALT = Deno.env.get('IP_HASH_SALT') ?? 'drop-bsb-default-salt-troque-isto';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    // Nunca vaza detalhe de configuração para o cliente — só loga no servidor.
    console.error('admin-login: variáveis de ambiente do Supabase ausentes.');
    return jsonResponse({ error: 'server_misconfigured' }, 500);
  }

  let email: string, password: string;
  try {
    const body = await req.json();
    email = String(body.email ?? '').trim();
    password = String(body.password ?? '');
  } catch {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  if (!email || !password) return jsonResponse({ error: 'invalid_request' }, 400);

  const ip = getClientIp(req);
  const ipHash = await hashIp(ip, IP_SALT);

  // Cliente com service_role: existe SOMENTE aqui no servidor, nunca chega ao navegador.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1) Checa bloqueio (por e-mail OU por IP — combina os dois sinais, Seção 2 do briefing).
  const { data: blockCheck, error: blockErr } = await admin.rpc('check_login_blocked', {
    p_email: email,
    p_ip_hash: ipHash,
  });
  if (blockErr) {
    console.error('admin-login: erro ao checar bloqueio', blockErr);
    return jsonResponse({ error: 'internal_error' }, 500);
  }
  if (blockCheck?.[0]?.blocked) {
    return jsonResponse({ error: 'blocked', wait_seconds: blockCheck[0].wait_seconds }, 429);
  }

  // 2) Tenta autenticar de verdade, com um client separado (anon key — fluxo padrão do Auth).
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });

  // 3) Registra o resultado — sucesso zera os contadores; falha incrementa e pode bloquear.
  const { data: attemptResult, error: registerErr } = await admin.rpc('register_login_attempt', {
    p_email: email,
    p_ip_hash: ipHash,
    p_success: !signInError,
  });
  if (registerErr) console.error('admin-login: erro ao registrar tentativa', registerErr);

  if (signInError || !signInData?.session) {
    if (attemptResult?.[0]?.blocked) {
      return jsonResponse({ error: 'blocked', wait_seconds: attemptResult[0].wait_seconds }, 429);
    }
    // Mensagem sempre genérica — nunca confirma se o e-mail existe (Seção 49 do briefing original).
    return jsonResponse({ error: 'invalid_credentials' }, 401);
  }

  // 4) Devolve só o necessário para o cliente restaurar a sessão. Sem service_role,
  // sem detalhes internos, sem confirmar nada sobre o e-mail além do login ter funcionado.
  return jsonResponse(
    {
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
    },
    200
  );
});
