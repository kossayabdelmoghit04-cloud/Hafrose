import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Admin Dashboard Layout Architecture
 * Responsibilities:
 * - Back-office navigation drawer / sidebar
 * - Topbar with admin profile, notifications, system metrics
 * - Dedicated management viewport
 */
export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-neutral-100 text-neutral-900">
      <aside id="hafrose-admin-sidebar" className="w-64 bg-hafrose-charcoal text-white flex-shrink-0">
        {/* Admin Navigation placeholder */}
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header id="hafrose-admin-topbar" className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between">
          {/* Admin topbar placeholder */}
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
