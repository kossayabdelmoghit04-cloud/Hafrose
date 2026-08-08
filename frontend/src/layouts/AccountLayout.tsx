import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { AccountSidebar } from '../components/account/AccountSidebar';

/**
 * Account Layout Shell Architecture
 * Responsibilities:
 * - Customer Dashboard Navigation (Profile, Orders, Wishlist, Addresses)
 * - Protected Area Frame with Luxury Styling
 */
export const AccountLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-100 py-8 md:py-12">
      <Container>
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Mon Espace Client' },
          ]}
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 xl:col-span-3 sticky top-24">
            <AccountSidebar />
          </aside>
          <main className="lg:col-span-8 xl:col-span-9 min-h-[500px]">
            <Outlet />
          </main>
        </div>
      </Container>
    </div>
  );
};
