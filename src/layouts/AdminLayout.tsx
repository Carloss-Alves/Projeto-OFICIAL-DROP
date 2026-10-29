import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Award, Image, ShoppingCart, Boxes, Ticket, Settings, LogOut, Camera,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/marcas', label: 'Marcas', icon: Award },
  { to: '/admin/estoque', label: 'Estoque', icon: Boxes },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/cupons', label: 'Cupons', icon: Ticket },
  { to: '/admin/instagram', label: 'Instagram', icon: Camera },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export function AdminLayout() {
  const { signOut } = useAdminAuth();

  return (
    <div className="min-h-screen flex bg-ink-950">
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-ink-800 p-4">
        <span className="text-display text-lg px-2 mb-6">DROP BSB Admin</span>
        <nav className="flex flex-col gap-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 h-10 rounded-sm text-sm transition-colors ${
                  isActive ? 'bg-ink-800 text-bone-50' : 'text-ink-400 hover:text-bone-50 hover:bg-ink-900'
                }`
              }
            >
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="mt-auto flex items-center gap-3 px-3 h-10 rounded-sm text-sm text-ink-400 hover:text-sale-500"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden h-14 flex items-center px-4 border-b border-ink-800">
          <span className="text-display text-base">DROP BSB Admin</span>
        </div>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
