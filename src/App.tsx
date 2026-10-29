import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { RequireAdmin } from '@/components/admin/RequireAdmin';

import { HomePage } from '@/pages/HomePage';
import { ProductListPage } from '@/pages/ProductListPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { AboutPage } from '@/pages/AboutPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminProductFormPage } from '@/pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminBrandsPage } from '@/pages/admin/AdminBrandsPage';
import { AdminBannersPage } from '@/pages/admin/AdminBannersPage';
import { AdminStockPage } from '@/pages/admin/AdminStockPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage';
import { AdminInstagramPage } from '@/pages/admin/AdminInstagramPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Loja pública */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos" element={<ProductListPage />} />
          <Route path="/produto/:slug" element={<ProductDetailPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="produtos" element={<AdminProductsPage />} />
          <Route path="produtos/novo" element={<AdminProductFormPage />} />
          <Route path="produtos/:id" element={<AdminProductFormPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="marcas" element={<AdminBrandsPage />} />
          <Route path="estoque" element={<AdminStockPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
          <Route path="cupons" element={<AdminCouponsPage />} />
          <Route path="instagram" element={<AdminInstagramPage />} />
          <Route path="configuracoes" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
