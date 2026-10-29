import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AdminAuthValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function checkAdmin(userId: string) {
    const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle();
    setIsAdmin(Boolean(data));
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      if (data.user) await checkAdmin(data.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await checkAdmin(session.user.id);
      else setIsAdmin(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não está configurado neste ambiente. Preencha .env com suas credenciais.' };
    }

    // Caminho principal: Edge Function "admin-login" (supabase/functions/admin-login).
    // O navegador NUNCA chama supabase.auth.signInWithPassword() diretamente para o
    // Admin — quem decide se a tentativa chega até o Supabase Auth é o servidor
    // (Deno), que checa bloqueio por e-mail E por IP antes de tentar autenticar.
    // Isso fecha a lacuna que existia antes: um cliente malicioso não pode mais
    // pular a checagem de bloqueio chamando a API de Auth direto pelo navegador,
    // porque a Edge Function é a única peça com acesso à service_role para as
    // RPCs de bloqueio, e é ela quem efetivamente faz o login.
    const edgeResult = await signInViaEdgeFunction(email, password);
    if (edgeResult !== 'edge_function_unavailable') return edgeResult;

    // Fallback: a Edge Function não foi implantada ainda neste projeto (deploy é
    // configuração externa — ver README). Sem ela, caímos para a checagem via RPC
    // chamada direto do navegador — mesma proteção de antes, só que sem o sinal de
    // IP (o navegador não tem como obter o IP real do cliente de forma confiável) e
    // com a limitação já documentada: um cliente malicioso PODERIA pular esta
    // checagem chamando signInWithPassword direto. Isso não deixa o Admin
    // destrancado nesse meio-tempo — o rate limiting nativo do Supabase Auth
    // continua sempre ativo por baixo, façamos o deploy da função ou não.
    return signInViaDirectRpcFallback(email, password);
  }

  async function signInViaEdgeFunction(
    email: string,
    password: string
  ): Promise<{ error: string | null } | 'edge_function_unavailable'> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-login', { body: { email, password } });

      if (error) {
        // FunctionsHttpError traz a resposta original em error.context; usamos o
        // corpo JSON quando disponível para diferenciar "bloqueado" de "credenciais
        // inválidas" de "função não implantada" (o que ativa o fallback).
        const status = (error as any)?.context?.status as number | undefined;
        if (status === undefined) return 'edge_function_unavailable'; // erro de rede/CORS/404: função provavelmente não implantada
        let payload: any = null;
        try { payload = await (error as any).context.json(); } catch { /* corpo não é JSON, segue sem payload */ }

        if (status === 429 && payload?.wait_seconds) {
          const minutes = Math.ceil(payload.wait_seconds / 60);
          return { error: `Muitas tentativas. Tente novamente em ${minutes} minuto${minutes === 1 ? '' : 's'}.` };
        }
        if (status === 401) return { error: 'Email ou senha inválidos.' };
        if (status === 404) return 'edge_function_unavailable';
        return { error: 'Não foi possível entrar agora. Tente novamente em instantes.' };
      }

      if (!data?.access_token || !data?.refresh_token) {
        return { error: 'Não foi possível entrar agora. Tente novamente em instantes.' };
      }

      // Restaura a sessão no SDK do navegador a partir dos tokens que a Edge
      // Function devolveu (ela nunca envia a service_role_key, só os tokens da
      // sessão de quem acabou de autenticar de verdade).
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (setSessionError) return { error: 'Não foi possível entrar agora. Tente novamente em instantes.' };

      return { error: null };
    } catch {
      return 'edge_function_unavailable';
    }
  }

  async function signInViaDirectRpcFallback(email: string, password: string): Promise<{ error: string | null }> {
    const { data: blockCheck, error: blockCheckError } = await supabase.rpc('check_login_blocked', { p_email: email });
    if (!blockCheckError && blockCheck?.[0]?.blocked) {
      const minutes = Math.ceil((blockCheck[0].wait_seconds ?? 60) / 60);
      return { error: `Muitas tentativas. Tente novamente em ${minutes} minuto${minutes === 1 ? '' : 's'}.` };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    const { data: attemptResult } = await supabase.rpc('register_login_attempt', {
      p_email: email,
      p_success: !error,
    });

    if (error) {
      if (attemptResult?.[0]?.blocked) {
        const minutes = Math.ceil((attemptResult[0].wait_seconds ?? 60) / 60);
        return { error: `Muitas tentativas. Tente novamente em ${minutes} minuto${minutes === 1 ? '' : 's'}.` };
      }
      return { error: 'Email ou senha inválidos.' };
    }

    return { error: null };
  }

  async function signOut() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
  }

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth deve ser usado dentro de <AdminAuthProvider>');
  return ctx;
}
