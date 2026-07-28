import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingBag,
  FiMapPin,
  FiUser,
  FiHeart,
  FiBell,
  FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/account/dashboard', label: 'Tableau de bord', icon: FiGrid },
  { path: '/account/orders', label: 'Mes Commandes', icon: FiShoppingBag },
  { path: '/account/addresses', label: 'Adresses de livraison', icon: FiMapPin },
  { path: '/account/profile', label: 'Profil & Sécurité', icon: FiUser },
  { path: '/account/wishlist', label: 'Mes Favoris', icon: FiHeart },
  { path: '/account/notifications', label: 'Notifications', icon: FiBell },
];

export default function AccountSidebar({ className = '' }) {
  const { customerUser, customerLogout } = useAuth();

  const initials = customerUser?.name
    ? customerUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MH';

  return (
    <aside className={`bg-off-white border border-beige p-6 space-y-8 ${className}`}>
      {/* User Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-beige">
        <div className="w-12 h-12 rounded-full bg-luxury-charcoal text-off-white font-serif text-base flex items-center justify-center flex-shrink-0 tracking-wider">
          {initials}
        </div>
        <div className="overflow-hidden">
          <h3 className="font-serif text-base text-luxury-charcoal font-light truncate">
            {customerUser?.name || 'Client Privilège'}
          </h3>
          <p className="font-sans text-[10px] uppercase tracking-widest text-rose-gold truncate">
            Membre Maison Hafrose
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1" aria-label="Menu espace client">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 font-sans text-xs uppercase tracking-wider transition-colors font-medium ${
                  isActive
                    ? 'bg-white border-l-2 border-rose-gold text-luxury-charcoal shadow-sm'
                    : 'text-warm-gray hover:text-luxury-charcoal hover:bg-white/60'
                }`
              }
            >
              <Icon size={15} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Déconnexion */}
        <button
          type="button"
          onClick={customerLogout}
          className="w-full flex items-center gap-3 px-4 py-3 font-sans text-xs uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors font-medium text-left mt-4"
        >
          <FiLogOut size={15} aria-hidden="true" />
          <span>Se déconnecter</span>
        </button>
      </nav>
    </aside>
  );
}
