import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, AlertTriangle, XCircle, ShoppingCart } from 'lucide-react';
import { adminFetchDashboardStats } from '@/services/admin';
import { isSupabaseConfigured } from '@/lib/supabase';

function StatCard({ icon: Icon, label, value, tone = 'default' }: { icon: any; label: string; value: number | string; tone?: 'default' | 'warn' | 'danger' }) {
  const toneColor = tone === 'warn' ? 'text-signal-400' : tone === 'danger' ? 'text-sale-500' : 'text-bone-50';
  return (
    <div className="bg-ink-900 border border-ink-800 rounded-md p-5">
      <Icon size={18} className="text-ink-400 mb-3" />
      <span className={`text-3xl font-semibold ${toneColor}`}>{value}</span>
      <p className="text-xs text-ink-400 mt-1">{label}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminFetchDashboardStats>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    adminFetchDashboardStats().then(setStats).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-display text-3xl mb-2">Dashboard</h1>
      <p className="text-ink-400 text-sm mb-8">Visão geral da loja.</p>

      {!isSupabaseConfigured && (
        <div className="mb-8 p-4 rounded-sm bg-ink-900 border border-ink-700 text-sm text-ink-300">
          Conecte o Supabase (variáveis de ambiente) para ver estatísticas reais e usar o CRUD completo.
          Veja o <code className="text-signal-400">README.md</code> para o passo a passo.
        </div>
      )}
      {error && <p className="text-sale-500 text-sm mb-6">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <StatCard icon={Package} label="Produtos cadastrados" value={stats.totalProducts} />
          <StatCard icon={CheckCircle} label="Produtos ativos" value={stats.activeProducts} />
          <StatCard icon={AlertTriangle} label="Estoque baixo" value={stats.lowStockCount} tone="warn" />
          <StatCard icon={XCircle} label="Esgotados" value={stats.outOfStockCount} tone="danger" />
          <StatCard icon={ShoppingCart} label="Pedidos recebidos" value={stats.totalOrders} />
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/admin/produtos/novo" className="p-5 bg-ink-900 border border-ink-800 rounded-md hover:border-signal-500 transition-colors">
          <span className="text-sm font-medium">+ Cadastrar produto</span>
          <p className="text-xs text-ink-400 mt-1">Adicione uma nova peça ao catálogo.</p>
        </Link>
        <Link to="/admin/instagram" className="p-5 bg-ink-900 border border-ink-800 rounded-md hover:border-signal-500 transition-colors">
          <span className="text-sm font-medium">Gerenciar Instagram</span>
          <p className="text-xs text-ink-400 mt-1">Atualize os posts e a imagem de perfil.</p>
        </Link>
        <Link to="/admin/configuracoes" className="p-5 bg-ink-900 border border-ink-800 rounded-md hover:border-signal-500 transition-colors">
          <span className="text-sm font-medium">Configurações da loja</span>
          <p className="text-xs text-ink-400 mt-1">WhatsApp, Instagram, identidade.</p>
        </Link>
      </div>
    </div>
  );
}
