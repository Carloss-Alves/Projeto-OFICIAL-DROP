import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppFloatingButton />
      <CartDrawer />
    </div>
  );
}
