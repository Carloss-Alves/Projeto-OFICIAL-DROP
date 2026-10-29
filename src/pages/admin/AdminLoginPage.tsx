import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/Button';
import { isSupabaseConfigured } from '@/lib/supabase';

export function AdminLoginPage() {
  const { user, isAdmin, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user && isAdmin) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
    else navigate('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <span className="eyebrow">Painel administrativo</span>
        <h1 className="text-display text-3xl mt-1 mb-8">Entrar</h1>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-3 rounded-sm bg-ink-900 border border-ink-700 text-xs text-ink-300">
            O Supabase ainda não está configurado (variáveis de ambiente ausentes). Preencha
            <code className="mx-1 text-signal-400">VITE_SUPABASE_URL</code> e
            <code className="mx-1 text-signal-400">VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code> —
            veja o README para o passo a passo de criar seu primeiro admin.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-ink-400">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 bg-ink-900 border border-ink-700 rounded-sm px-3 outline-none focus:border-signal-500"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-ink-400">Senha</span>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12 bg-ink-900 border border-ink-700 rounded-sm px-3 outline-none focus:border-signal-500"
            />
          </label>
          {error && <p className="text-sale-500 text-sm">{error}</p>}
          <Button type="submit" variant="primary" fullWidth disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
