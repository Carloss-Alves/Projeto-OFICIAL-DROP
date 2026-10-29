# DROP BSB — E-commerce Premium de Streetwear

Loja virtual completa para streetwear/esportivo (Nike, Lacoste e outras marcas), com painel administrativo, curadoria de novidades, integração com WhatsApp e arquitetura pronta para produção.

> **DROP BSB** é o nome da marca. A loja **não** funciona com lançamentos programados por horário — "DROP" é identidade, não uma funcionalidade de contagem regressiva. Produtos entram no catálogo pelo Admin e ficam disponíveis até acabar o estoque.

> **Status:** frontend, admin e banco de dados prontos. Funciona em **modo demo** sem nenhuma configuração — basta rodar `npm install && npm run dev`. Para dados reais, siga a seção [Configurar o Supabase](#configurar-o-supabase).

---

## Sumário

- [Tecnologias](#tecnologias)
- [Rodando localmente](#rodando-localmente)
- [Modo demo vs. modo real](#modo-demo-vs-modo-real)
- [Configurar o Supabase](#configurar-o-supabase)
- [Criar o primeiro administrador](#criar-o-primeiro-administrador)
- [Segurança do login — proteção contra força bruta](#segurança-do-login--proteção-contra-força-bruta)
- [Cadastrar produtos](#cadastrar-produtos)
- [Upload de imagens — como funciona e como validar](#upload-de-imagens--como-funciona-e-como-validar)
- [Configurar o WhatsApp](#configurar-o-whatsapp)
- [Configurar o Instagram](#configurar-o-instagram)
- [Estoque](#estoque)
- [Formas de pagamento futuras](#formas-de-pagamento-futuras)
- [Testes](#testes)
- [Build e deploy](#build-e-deploy)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pendências reais](#pendências-reais)

---

## Tecnologias

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (design system em `src/index.css` — base escura `#080808`, texto `#E8E8E8`, botões `#1C1C1C`, verde `#B7FF00` só como detalhe)
- React Router 7
- Supabase (Postgres, Auth, Storage, RLS)
- Framer Motion, Lucide Icons
- Vitest + Testing Library (testes unitários, incluindo o pipeline de imagens)
- Playwright (testes E2E)

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. Sem nenhuma variável de ambiente configurada, o site roda em **modo demo** com 13 produtos fictícios (Nike e Lacoste) definidos em `src/data/demoData.ts`, claramente identificados como demonstração.

## Modo demo vs. modo real

Toda a camada de dados (`src/services/catalog.ts` e `src/services/admin.ts`) verifica `isSupabaseConfigured` (em `src/lib/supabase.ts`). Sem as variáveis de ambiente:

- A loja pública mostra os produtos demo, com badge "Demo" nos cards.
- O `/admin` mostra avisos claros em vez de travar, e nenhuma escrita é tentada.

Assim que você preenche `.env`, **o mesmo código** passa a usar dados reais — não é necessário alterar nenhum componente.

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode os arquivos nesta ordem:
   1. `supabase/schema.sql` — cria todas as tabelas, índices e triggers.
   2. `supabase/rls.sql` — ativa Row Level Security e as policies (público só lê o que é ativo; só admin escreve).
   3. `supabase/storage.sql` — cria os buckets de imagens (`product-images`, `banner-images`, `brand-logos`) e as policies de upload.
   4. `supabase/security.sql` — proteção contra força bruta no login (tabelas `login_attempts`/`login_attempts_ip` + RPCs), usada pela Edge Function `admin-login` (ver [Segurança do login](#segurança-do-login--proteção-contra-força-bruta)).
   5. *(opcional)* `supabase/seed.sql` — popula com os mesmos 17 produtos de demonstração (Nike, Lacoste, Tommy Hilfiger), para você já ver o admin funcionando com dados reais antes de cadastrar o catálogo de verdade.
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`.
4. Copie `.env.example` para `.env` e preencha:

   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

5. Reinicie `npm run dev`.

**Nunca** coloque a `service_role key` no frontend — ela não é usada em nenhum lugar deste projeto. Apenas a `anon key` (pública por design, protegida pelas policies de RLS) é necessária.

## Criar o primeiro administrador

O Supabase Auth cuida do login, mas **estar autenticado não é suficiente** — é preciso também existir uma linha na tabela `admin_users` (é isso que a RLS usa para liberar escrita).

1. No painel Supabase → **Authentication → Users → Add user**, crie seu usuário com e-mail e senha.
2. Copie o `UID` desse usuário.
3. No **SQL Editor**, rode:

   ```sql
   insert into admin_users (user_id, full_name, role)
   values ('COLE-O-UID-AQUI', 'Seu nome', 'admin');
   ```

4. Acesse `/admin/login` no site e entre com o e-mail/senha criados.

Sem esse passo, o login funciona mas o acesso ao `/admin` continua bloqueado (por design — ver `RequireAdmin` e a policy `is_admin()`).

## Segurança do login — proteção contra força bruta

O login do Admin **não** chama `supabase.auth.signInWithPassword()` direto do navegador. Ele passa por uma Edge Function (`supabase/functions/admin-login`) que roda no servidor e decide, antes de qualquer tentativa de autenticação, se aquele e-mail ou aquele IP (com hash — o IP nunca é gravado em texto puro) já ultrapassou o limite de tentativas. Bloqueio progressivo: 3 falhas → 5 min, 6 → 15 min, 9+ → 1 hora — nunca banimento permanente automático.

**Para ativar de verdade** (isso exige o Supabase CLI e é configuração externa, não simulável num ambiente de desenvolvimento):

```bash
supabase login
supabase link --project-ref SEU-PROJETO
supabase secrets set IP_HASH_SALT=$(openssl rand -hex 32)
supabase functions deploy admin-login
```

Rode também `supabase/security.sql` no SQL Editor (cria as tabelas `login_attempts`/`login_attempts_ip` e as RPCs de checagem/registro que a função usa).

**Enquanto a função não está implantada**, o Admin continua funcionando: o frontend detecta que a chamada à Edge Function falhou e cai automaticamente para um modo de proteção via RPC direta (mesma lógica de bloqueio, só que sem o sinal de IP, que só o servidor consegue obter com confiança). Esse fallback é *best-effort* — a proteção completa só fecha de verdade com a função implantada — mas o rate limiting nativo do próprio Supabase Auth continua ativo por baixo o tempo todo, com ou sem a função.

## Cadastrar produtos

Pelo painel: `/admin/produtos/novo`. Preencha nome, marca, categoria, preço, tamanhos/estoque, envie as fotos (arraste para reordenar, clique na estrela para definir a principal) e marque as sinalizações (novo, destaque, mais vendido, etc.). Ao salvar, o produto já aparece automaticamente na Home (se marcado), na categoria, na busca e nos filtros — sem precisar tocar em código.

Para trocar as fotos de demonstração pelas suas: `/admin/produtos` → editar o produto → na área de fotos, remova a imagem demo (ícone de lixeira) e envie a sua — o upload já salva automaticamente no Supabase Storage.

## Upload de imagens — como funciona e como validar

Fluxo completo: **Admin seleciona arquivo → upload para o bucket `product-images` no Supabase Storage → `getPublicUrl()` retorna uma URL pública → essa URL é gravada em `product_images.url` ao salvar o produto → o catálogo público (`fetchProducts`/`fetchProductBySlug`) busca essas linhas via join e as entrega prontas para `ProductCard`/`ProductGallery`, que apenas renderizam `<img src={url}>`.**

Duas causas raiz reais de "a imagem não aparecia no site" foram encontradas e corrigidas nesta versão:

1. **Condição de corrida no upload múltiplo** (`src/components/admin/ImageUploader.tsx`): quando duas ou mais imagens subiam em paralelo, cada atualização de estado partia de uma cópia "congelada" da lista capturada no início do upload — a última a terminar sobrescrevia o resultado das anteriores, e a URL real do Storage podia se perder do formulário antes de salvar, mesmo com o arquivo já no bucket. Corrigido usando o *setState* funcional do React (`onChange(current => ...)`) em vez de recalcular a partir de uma variável fechada em closure.
2. **Filtro por categoria/marca com sintaxe inválida do PostgREST** (`src/services/catalog.ts`): o código usava `.eq('category.slug', x)` para filtrar por uma tabela relacionada, o que não funciona sem o join hint `!inner` — e adicionar `!inner` sempre excluiria produtos sem marca/categoria de todas as consultas. A consulta falhava silenciosamente (sem `.catch()` nas páginas, o erro nunca aparecia) e a categoria simplesmente ficava vazia. Corrigido resolvendo o slug para o `id` real antes de filtrar (`category_id`/`brand_id`, colunas indexadas), e adicionado tratamento de erro visível na Home e na listagem de produtos.

**Testes automatizados desse pipeline**: `src/services/imagePipeline.test.ts` mocka o cliente Supabase (algo que os testes anteriores não faziam — eles sempre caíam no modo demo) e valida: a URL retornada pelo upload é pública/https e nunca `blob:`; o payload gravado em `product_images` preserva URL, ordem e imagem principal; o filtro por categoria resolve o slug corretamente e nunca usa a sintaxe quebrada. Rode com `npm run test`.

**Checagem manual recomendada** (este projeto foi montado num sandbox sem acesso de rede a domínios do Supabase, então uma requisição HTTP real às imagens não pode ser automatizada aqui): depois de configurar seu projeto, cadastre um produto com foto e abra a página dele — se a imagem não aparecer, abra o DevTools → Network e confira o status da requisição da imagem: **403** normalmente indica que `supabase/storage.sql` não foi executado (bucket não é público); **404** indica que o arquivo não chegou a ser enviado (verifique erros no console do navegador durante o upload).

## Configurar o WhatsApp

Em `/admin/configuracoes`, preencha o número (formato internacional, só números — ex: `5561996943237`) e, se quiser, personalize a mensagem padrão usando os placeholders `{product}`, `{size}`, `{price}`, `{link}`. O número nunca fica hardcoded no código — vive em `site_settings` no banco. A exibição formatada (`+55 61 99694-3237`) é gerada automaticamente por `formatPhoneBR()` em `src/utils/format.ts`.

## Configurar o Instagram

Em `/admin/instagram`:
- Cadastre os posts que aparecem na vitrine da Home (imagem, legenda opcional, link, ordem) — como a integração oficial com a API do Instagram exige credenciais de app da Meta e revisão, por enquanto o cadastro é manual.
- Envie a **imagem de perfil** da conta (`instagram_profile_image_url`, salva no Storage) — ela aparece ao lado do @handle na Home e no rodapé, no lugar de um ícone genérico.

O handle e o link (`https://www.instagram.com/{handle}/`) também podem ser ajustados em `/admin/configuracoes`.

## Estoque

Estoque é por variação (tamanho), controlado em `/admin/estoque` ou direto no formulário do produto. Quando um tamanho chega a 0, fica bloqueado na página do produto (`ESGOTADO`); quando está igual ou abaixo do "limite para últimas peças" (configurável por produto), mostra "Últimas X unidades". Não existe expiração automática — o produto some da vitrine apenas se você desativá-lo ou se todo o estoque acabar.

## Formas de pagamento futuras

O checkout atual é Carrinho → WhatsApp. A tabela `orders`/`order_items` já registra cada pedido finalizado, com `status` (`pending_whatsapp`, `confirmed`, `paid`, `shipped`, `completed`, `cancelled`) pronta para quando você integrar Mercado Pago, Stripe ou Pix — ponto de entrada natural: `createOrderFromCart` em `src/services/admin.ts`.

## Testes

```bash
npm run test        # Vitest — testes unitários (28 testes: carrinho, estoque, WhatsApp, busca, seleção de tamanho, pipeline de imagens)
npm run test:watch  # Vitest em modo watch

npx playwright install   # baixa os navegadores (uma vez)
npm run test:e2e         # Playwright — fluxos de ponta a ponta
```

> Os specs E2E (`e2e/home.spec.ts`, `e2e/product.spec.ts`) foram escritos mas **não executados neste ambiente**, porque o sandbox de desenvolvimento usado para montar o projeto não tem acesso de rede a `cdn.playwright.dev` (necessário para baixar o Chromium) nem a domínios do Supabase. Rode `npx playwright install && npm run test:e2e` na sua máquina.

## Build e deploy

```bash
npm run build     # tsc -b && vite build — testado e passando sem erros
npm run preview   # serve o build de produção localmente
```

Gera `dist/`, pronto para qualquer host estático.

**Vercel:** importe o repositório, framework preset "Vite", adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas Environment Variables.

**Netlify:** `Build command: npm run build`, `Publish directory: dist`, mesmas variáveis de ambiente em Site settings → Environment variables. O arquivo `public/_redirects` já está incluído para as rotas do React Router funcionarem direto por URL.

## Estrutura do projeto

```
src/
  components/   ui, layout, product, home, cart, admin
  pages/        páginas públicas + pages/admin
  layouts/      RootLayout (loja) e AdminLayout (painel)
  context/      Cart, Favorites, AdminAuth, Toast
  hooks/        useSiteSettings, useDebounce, useSeo
  services/     catalog.ts (leitura pública) e admin.ts (CRUD administrativo)
  data/         demoData.ts (13 produtos de demonstração, claramente sinalizados)
  lib/          cliente Supabase
  types/        tipos centrais do domínio
  utils/        formatação de preço/estoque/telefone, link do WhatsApp
supabase/
  schema.sql    tabelas, índices, triggers
  rls.sql       Row Level Security e policies
  storage.sql   buckets e policies de upload
  security.sql  proteção contra força bruta no login (usada pela Edge Function)
  seed.sql      dados de demonstração para popular um projeto novo
  functions/
    admin-login/  Edge Function: proxy seguro do login do Admin
e2e/            testes Playwright
```

## Pendências reais

- **Deploy da Edge Function `admin-login`**: exige Supabase CLI + projeto vinculado + `supabase secrets set` + `supabase functions deploy` — configuração externa, não simulável neste ambiente. Sem o deploy, o login continua funcionando via fallback (ver [Segurança do login](#segurança-do-login--proteção-contra-força-bruta)), com proteção reduzida.
- **Teste real de bloqueio do Admin** (não autenticado/usuário comum → negado) só pode ser validado com um projeto Supabase de verdade e usuários reais.
- **E2E não executado neste ambiente** (ver seção Testes) — os specs existem e devem rodar normalmente fora deste sandbox.
- **Checagem HTTP real das imagens** não foi automatizada (ver [Upload de imagens](#upload-de-imagens--como-funciona-e-como-validar)) — sandbox sem rede até domínios do Supabase. Validação manual recomendada após configurar seu projeto.
- **PWA**: manifest e ícone SVG prontos; falta gerar ícones PNG (192/512px) se quiser instalação mais robusta em iOS/Android.
- **Analytics** (GA4/Meta Pixel): pontos de evento já isolados nos handlers de `ProductDetailPage.tsx`, `CartDrawer.tsx` e `FavoriteButton.tsx`, mas a integração em si depende das suas credenciais e não foi implementada.
- **Tabela `drops`**: continua no schema por não quebrar nada à toa, mas não é mais usada pelo frontend (a DROP BSB não usa lançamento programado). Pode ser ignorada ou removida futuramente se quiser.
