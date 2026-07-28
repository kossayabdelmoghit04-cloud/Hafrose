import { Outlet } from 'react-router-dom';
import AccountSidebar from '../../components/account/AccountSidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';

export default function AccountLayout() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Espace Client', path: '/account/dashboard' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <AccountSidebar />
        </div>

        {/* Content */}
        <div className="lg:col-span-8 xl:col-span-9 bg-off-white border border-beige p-6 md:p-10 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
