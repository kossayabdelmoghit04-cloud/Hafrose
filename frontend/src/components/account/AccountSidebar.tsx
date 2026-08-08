import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, MapPin, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLogout } from '../../hooks/useAuthHooks';
import { Card } from '../ui/Card';
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

  const userInitial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : (user?.name?.charAt(0).toUpperCase() || 'H');
  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Membre HAFROSE' : 'Membre HAFROSE';

  return (
    <Card className="p-6 bg-white border border-neutral-200/60 shadow-hafrose-card space-y-6">
      {/* Profile Avatar Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-neutral-200">
        <div className="w-12 h-12 rounded-full bg-rose-powder text-burgundy-600 flex items-center justify-center font-serif text-h4 font-bold shadow-hafrose-xs">
          {userInitial}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-caption font-sans uppercase tracking-luxury font-semibold text-burgundy-500 block">
            Espace Privé
          </span>
          <h2 className="font-serif text-h5 text-neutral-900 truncate">
            {fullName}
          </h2>
          <p className="text-caption text-neutral-500 truncate">{user?.email || 'client@hafrose.com'}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Navigation espace client" className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-3 rounded-xs text-body-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-rose-powder/60 text-burgundy-700 font-semibold border-l-2 border-burgundy-500 shadow-hafrose-xs'
                  : 'text-neutral-700 hover:bg-cream-100 hover:text-burgundy-600'
              )
            }
          >
            <item.icon className="w-4 h-4 text-burgundy-500 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xs text-body-sm font-medium text-error-600 hover:bg-error-50 transition-colors duration-200 text-left mt-4 border-t border-neutral-100 pt-4"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>{logoutMutation.isPending ? 'Déconnexion...' : 'Déconnexion'}</span>
        </button>
      </nav>
    </Card>
  );
};
