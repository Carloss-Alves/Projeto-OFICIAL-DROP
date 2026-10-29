import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink-400">Carregando…</div>;
  }
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
