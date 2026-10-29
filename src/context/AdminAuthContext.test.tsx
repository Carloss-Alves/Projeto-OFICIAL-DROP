import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

// ----------------------------------------------------------------------------
// Testa o fluxo de login do Admin descrito em AdminAuthContext.tsx:
// 1) tenta a Edge Function "admin-login" primeiro (nunca chama
//    supabase.auth.signInWithPassword direto quando ela está disponível);
// 2) usa setSession() para restaurar a sessão a partir dos tokens devolvidos;
// 3) cai para o fallback via RPC direta somente quando a função não responde
//    (simulando um projeto sem o deploy feito ainda);
// 4) nunca revela se o e-mail existe — mensagem sempre genérica.
// ----------------------------------------------------------------------------

const functionsInvoke = vi.fn();
const authSignInWithPassword = vi.fn();
const authSetSession = vi.fn();
const authGetUser = vi.fn(async () => ({ data: { user: null } }));
const authOnAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }));
const rpc = vi.fn();
const fromMaybeSingle = vi.fn(async () => ({ data: null }));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    functions: { invoke: functionsInvoke },
    auth: {
      signInWithPassword: authSignInWithPassword,
      setSession: authSetSession,
      getUser: authGetUser,
      onAuthStateChange: authOnAuthStateChange,
    },
    rpc,
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: fromMaybeSingle })) })),
    })),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  authGetUser.mockResolvedValue({ data: { user: null } } as any);
});

async function loadProvider() {
  const { AdminAuthProvider, useAdminAuth } = await import('@/context/AdminAuthContext');
  const wrapper = ({ children }: { children: ReactNode }) => <AdminAuthProvider>{children}</AdminAuthProvider>;
  const rendered = renderHook(() => useAdminAuth(), { wrapper });
  // Deixa o useEffect inicial (getUser) resolver antes de cada teste interagir.
  await act(async () => {});
  return rendered;
}

describe('Login do Admin — Edge Function como caminho principal', () => {
  it('usa a Edge Function e restaura a sessão via setSession(), sem chamar signInWithPassword', async () => {
    functionsInvoke.mockResolvedValue({
      data: { access_token: 'tok-abc', refresh_token: 'ref-abc' },
      error: null,
    });
    authSetSession.mockResolvedValue({ error: null });

    const { result } = await loadProvider();
    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signIn('admin@dropbsb.com.br', 'senha-correta');
    });

    expect(functionsInvoke).toHaveBeenCalledWith('admin-login', { body: { email: 'admin@dropbsb.com.br', password: 'senha-correta' } });
    expect(authSetSession).toHaveBeenCalledWith({ access_token: 'tok-abc', refresh_token: 'ref-abc' });
    expect(authSignInWithPassword).not.toHaveBeenCalled();
    expect(response?.error).toBeNull();
  });

  it('repassa bloqueio por força bruta vindo da Edge Function (HTTP 429)', async () => {
    functionsInvoke.mockResolvedValue({
      data: null,
      error: { context: { status: 429, json: async () => ({ error: 'blocked', wait_seconds: 300 }) } },
    });

    const { result } = await loadProvider();
    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signIn('admin@dropbsb.com.br', 'senha-errada');
    });

    expect(response?.error).toContain('Muitas tentativas');
    expect(authSignInWithPassword).not.toHaveBeenCalled();
  });

  it('mensagem de credenciais inválidas é sempre genérica (não revela se o e-mail existe)', async () => {
    functionsInvoke.mockResolvedValue({
      data: null,
      error: { context: { status: 401, json: async () => ({ error: 'invalid_credentials' }) } },
    });

    const { result } = await loadProvider();
    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signIn('naoexiste@dropbsb.com.br', 'qualquer');
    });

    expect(response?.error).toBe('Email ou senha inválidos.');
  });

  it('cai para o fallback via RPC direta quando a Edge Function não está implantada', async () => {
    // Simula 404/erro de rede — o mock de invoke rejeita, como aconteceria
    // com uma função inexistente ou CORS falhando antes de qualquer resposta HTTP.
    functionsInvoke.mockRejectedValue(new Error('Failed to fetch'));
    rpc.mockImplementation((fn: string) => {
      if (fn === 'check_login_blocked') return Promise.resolve({ data: [{ blocked: false, wait_seconds: 0 }], error: null });
      if (fn === 'register_login_attempt') return Promise.resolve({ data: [{ blocked: false, wait_seconds: 0, message: 'ok' }], error: null });
      return Promise.resolve({ data: null, error: null });
    });
    authSignInWithPassword.mockResolvedValue({ error: null });

    const { result } = await loadProvider();
    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signIn('admin@dropbsb.com.br', 'senha-correta');
    });

    expect(authSignInWithPassword).toHaveBeenCalledWith({ email: 'admin@dropbsb.com.br', password: 'senha-correta' });
    expect(response?.error).toBeNull();
  });

  it('fallback também respeita bloqueio progressivo quando a RPC sinaliza', async () => {
    functionsInvoke.mockRejectedValue(new Error('Failed to fetch'));
    rpc.mockImplementation((fn: string) => {
      if (fn === 'check_login_blocked') return Promise.resolve({ data: [{ blocked: true, wait_seconds: 900 }], error: null });
      return Promise.resolve({ data: null, error: null });
    });

    const { result } = await loadProvider();
    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signIn('admin@dropbsb.com.br', 'x');
    });

    expect(response?.error).toContain('Muitas tentativas');
    expect(authSignInWithPassword).not.toHaveBeenCalled();
  });
});
