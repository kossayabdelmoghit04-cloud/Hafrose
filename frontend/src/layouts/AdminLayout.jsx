import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiGrid, 
  FiLayers, 
  FiBox, 
  FiShoppingCart, 
  FiStar, 
  FiMail, 
  FiSettings, 
  FiImage, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiUser
} from 'react-icons/fi';
import Loader from '../components/ui/Loader';
import { Suspense } from 'react';

import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Tableau de bord', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Catégories', path: '/admin/categories', icon: FiLayers },
    { name: 'Produits', path: '/admin/products', icon: FiBox },
    { name: 'Commandes', path: '/admin/orders', icon: FiShoppingCart },
    { name: 'Avis Clients', path: '/admin/reviews', icon: FiStar },
    { name: 'Messages de contact', path: '/admin/contacts', icon: FiMail },
    { name: 'Médiathèque', path: '/admin/media', icon: FiImage },
    { name: 'Paramètres', path: '/admin/settings', icon: FiSettings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-luxury-cream text-luxury-charcoal font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-luxury-charcoal text-white border-r border-luxury-gold/20">
        <div className="p-6 border-b border-luxury-gold/10">
          <div className="text-xl font-serif font-bold tracking-wider text-luxury-gold uppercase">
            Hafrose Admin
          </div>
          <span className="text-xs text-luxury-gray uppercase tracking-widest block mt-1">
            Espace Entreprise
          </span>
        </div>

        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-luxury-gold text-luxury-charcoal font-semibold shadow-md shadow-luxury-gold/10'
                      : 'text-luxury-gray hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-luxury-gold/10 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
              <FiUser className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-luxury-gray capitalize">{user?.role}</div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="danger"
            fullWidth
            icon={<FiLogOut className="w-4 h-4" />}
          >
            Se déconnecter
          </Button>
        </div>
      </aside>

      {/* Sidebar Mobile Drawer */}
      <Modal isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} variant="drawer-left">
        <Modal.Backdrop className="md:hidden" />
        <Modal.Container className="md:hidden w-64 bg-luxury-charcoal text-white flex flex-col p-4">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-luxury-gold/10">
            <div>
              <div className="text-lg font-serif font-bold text-luxury-gold uppercase">Hafrose Admin</div>
              <span className="text-[10px] text-luxury-gray uppercase tracking-wider block">Entreprise</span>
            </div>
            <Modal.CloseButton className="static text-luxury-gold hover:bg-white/10 hover:text-luxury-gold" />
          </div>

          <nav className="flex-grow space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-luxury-gold text-luxury-charcoal font-semibold'
                        : 'text-luxury-gray hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-luxury-gold/10">
            <Button
              onClick={handleLogout}
              variant="danger"
              fullWidth
              icon={<FiLogOut className="w-4 h-4" />}
            >
              Se déconnecter
            </Button>
          </div>
        </Modal.Container>
      </Modal>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-luxury-gold/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded md:hidden hover:bg-luxury-light-gray"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-serif font-semibold text-luxury-charcoal">
              Console d'Administration
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold">{user?.name}</span>
              <span className="text-xs text-luxury-gray capitalize">{user?.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold border border-luxury-gold/30">
              <FiUser className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Suspense fallback={<Loader fullPage />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

    </div>
  );
}
