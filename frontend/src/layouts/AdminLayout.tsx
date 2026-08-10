import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Star,
  Mail,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useAdminLogout } from '../features/admin/hooks/useAdminAuth';
import { useClearCache, useAdminDashboard } from '../features/admin/hooks/useAdminData';


interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badgeKey?: 'pending_orders' | 'unread_contacts' | 'pending_reviews';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'COMMERCE',
    items: [
      { name: 'Tableau de Bord', path: '/admin', icon: LayoutDashboard },
      { name: 'Produits', path: '/admin/products', icon: Package },
      { name: 'Catégories', path: '/admin/categories', icon: FolderTree },
      { name: 'Commandes', path: '/admin/orders', icon: ShoppingBag, badgeKey: 'pending_orders' },
      { name: 'Avis Clients', path: '/admin/reviews', icon: Star, badgeKey: 'pending_reviews' },
    ],
  },
  {
    title: 'CONTENU',
    items: [
      { name: 'Messages Contact', path: '/admin/contacts', icon: Mail, badgeKey: 'unread_contacts' },
      { name: 'Médiathèque', path: '/admin/media', icon: ImageIcon },
    ],
  },
  {
    title: 'ANALYTIQUE',
    items: [{ name: 'Statistiques & Ventes', path: '/admin/analytics', icon: BarChart3 }],
  },
  {
    title: 'SYSTÈME',
    items: [
      { name: 'Paramètres', path: '/admin/settings', icon: Settings },
      { name: 'Journaux d Audit', path: '/admin/logs', icon: ShieldCheck },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logoutMutation = useAdminLogout();
  const clearCacheMutation = useClearCache();
  const { data: dashboardData } = useAdminDashboard();

  const metrics = dashboardData?.metrics;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/admin/login', { replace: true });
  };

  const handleClearCache = async () => {
    await clearCacheMutation.mutateAsync();
  };

  // Get title of active page
  const getPageTitle = () => {
    const activeItem = NAV_SECTIONS.flatMap((s) => s.items).find((item) =>
      item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path)
    );
    return activeItem ? activeItem.name : 'Back-Office Admin';
  };

  return (
    <div className="min-h-screen flex bg-neutral-900 text-neutral-100 font-sans antialiased">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy-900/60 border border-burgundy-700/50 flex items-center justify-center text-burgundy-300 font-serif font-bold text-xl shadow-inner">
              H
            </div>
            <div>
              <span className="font-serif text-lg tracking-widest text-white block leading-none">
                HAFROSE
              </span>
              <span className="text-[10px] tracking-widest uppercase text-amber-500 font-medium mt-1 block">
                Luxury Back-Office
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-neutral-400 hover:text-white p-2"
            aria-label="Fermer le menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-thin scrollbar-thumb-neutral-800">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="px-3 text-[10px] font-semibold text-neutral-500 tracking-widest uppercase">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/admin'
                      ? location.pathname === '/admin'
                      : location.pathname.startsWith(item.path);

                  const badgeCount = item.badgeKey && metrics ? metrics[item.badgeKey] : 0;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-burgundy-900/40 text-white border border-burgundy-700/40 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-burgundy-400' : 'text-neutral-500 group-hover:text-neutral-300'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {badgeCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {badgeCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/80">
          <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-neutral-900/50 border border-neutral-800/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-burgundy-900/80 border border-burgundy-700/50 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrateur'}</p>
                <p className="text-[10px] text-neutral-400 truncate">{user?.email || 'admin@hafrose.com'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-2 text-neutral-400 hover:text-error-400 hover:bg-error-950/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* TOPBAR */}
        <header className="h-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
              aria-label="Ouvrir le menu navigation"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>HAFROSE ADMIN</span>
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span className="text-amber-500 font-medium">{getPageTitle()}</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl text-white font-medium tracking-wide mt-0.5">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Quick Actions & Profile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearCache}
              disabled={clearCacheMutation.isPending}
              title="Vider le cache système"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${clearCacheMutation.isPending ? 'animate-spin text-amber-400' : ''}`} />
              <span>Vider Cache</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              <span>Voir la boutique</span>
            </a>

            {/* Admin User Badge */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-semibold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline-block text-xs font-medium text-neutral-200">
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-neutral-800/60 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrateur'}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user?.email || 'admin@hafrose.com'}</p>
                    <span className="mt-1.5 inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {user?.role || 'admin'}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-error-400 hover:bg-error-950/40 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Se Déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
