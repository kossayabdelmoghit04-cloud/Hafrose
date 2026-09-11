import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, MapPin, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLogout } from '../../hooks/useAuthHooks';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { label: 'Tableau de Bord', href: '/account', icon: LayoutDashboard, end: true },
  { label: 'Mes Commandes', href: '/account/orders', icon: ShoppingBag, end: false },
  { label: 'Mes Favoris', href: '/account/wishlist', icon: Heart, end: false },
  { label: 'Mes Adresses', href: '/account/addresses', icon: MapPin, end: false },
  { label: 'Mon Profil', href: '/account/profile', icon: UserIcon, end: false },
];

export const AccountSidebar: React.FC = () => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/login');
  };

  const userInitial = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : user?.name?.charAt(0).toUpperCase() || 'H';

  const fullName =
    user
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Membre HAFROSE'
      : 'Membre HAFROSE';

  return (
    <div className="space-y-4">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MOBILE NAVIGATION BAR (< lg)                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden bg-white border border-neutral-200/80 rounded-md p-3 shadow-hafrose-card space-y-3">
        {/* User Mini Bar */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-full bg-burgundy-900 text-cream-100 flex items-center justify-center font-serif text-body-sm font-bold flex-shrink-0 shadow-hafrose-xs"
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="font-serif text-body-sm text-neutral-950 font-semibold truncate leading-tight">
                {fullName}
              </p>
              <p className="text-[11px] text-neutral-500 truncate font-sans">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            aria-label="Se déconnecter"
            className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xs text-caption font-medium text-error-600 bg-error-50 hover:bg-error-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-400"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{logoutMutation.isPending ? '…' : 'Sortir'}</span>
          </button>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <nav
          aria-label="Navigation espace client mobile"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full text-caption font-medium whitespace-nowrap transition-all duration-200 min-h-[40px]',
                  isActive
                    ? 'bg-burgundy-600 text-white shadow-hafrose-xs font-semibold'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-cream-200 hover:text-neutral-900'
                )
              }
            >
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DESKTOP SIDEBAR (>= lg)                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block bg-white border border-neutral-200/70 shadow-hafrose-card rounded-md overflow-hidden">
        {/* Profile header */}
        <div className="px-5 py-5 border-b border-neutral-100 bg-gradient-to-br from-burgundy-950 via-burgundy-900 to-burgundy-800 text-cream-100">
          <div className="flex items-center gap-3.5">
            <div
              aria-hidden="true"
              className="w-11 h-11 rounded-full border border-rose-300/30 bg-rose-500/10 text-cream-100 flex items-center justify-center font-serif text-h5 font-bold flex-shrink-0 shadow-hafrose-xs"
            >
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-sans uppercase tracking-luxury font-semibold text-rose-300 block mb-0.5">
                Espace Privé
              </span>
              <p className="font-serif text-h6 text-cream-100 truncate leading-snug">
                {fullName}
              </p>
              <p className="text-[11px] text-cream-200/60 truncate mt-0.5 font-sans">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Navigation espace client" className="px-2.5 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-sm text-body-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400 focus-visible:ring-offset-1',
                  isActive
                    ? 'bg-burgundy-50 text-burgundy-800 font-semibold border-l-[3px] border-burgundy-500 pl-[9px]'
                    : 'text-neutral-600 hover:bg-cream-100 hover:text-neutral-900 border-l-[3px] border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors duration-200',
                      isActive ? 'text-burgundy-600' : 'text-neutral-400 group-hover:text-burgundy-500'
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout CTA */}
        <div className="px-2.5 pb-3 pt-1 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            aria-label="Se déconnecter"
            className={cn(
              'group w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-body-sm font-medium transition-all duration-200',
              'text-error-600 hover:bg-error-50 hover:text-error-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-400 focus-visible:ring-offset-1',
              'border-l-[3px] border-transparent',
              logoutMutation.isPending && 'opacity-50 cursor-not-allowed'
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-error-500 group-hover:text-error-600 transition-colors" />
            <span>{logoutMutation.isPending ? 'Déconnexion…' : 'Déconnexion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
