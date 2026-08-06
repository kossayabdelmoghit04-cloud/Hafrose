import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Account Layout Shell Architecture
 * Responsibilities:
 * - Customer Dashboard Navigation (Profile, Orders, Wishlist, Addresses)
 * - Protected Area Frame
 */
export const AccountLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-hafrose-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside id="hafrose-account-sidebar" className="lg:col-span-1">
          {/* Account sidebar navigation slot */}
        </aside>
        <section id="hafrose-account-content" className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm">
          <Outlet />
        </section>
      </div>
    </div>
  );
};
