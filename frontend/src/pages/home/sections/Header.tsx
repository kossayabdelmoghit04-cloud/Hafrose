import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { IconButton } from '../../../components/ui/IconButton';
import { useCategories } from '../../../hooks/useProductHooks';
import { useAuthStore } from '../../../stores/useAuthStore';
import { cn } from '../../../utils/cn';

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onSearchOpen?: () => void;
  onCartOpen?: () => void;
}

export const Header = ({
  cartCount = 0,
  wishlistCount = 0,
  onSearchOpen,
  onCartOpen,
}: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Auth state — determines where 👤 navigates to
  const { isAuthenticated } = useAuthStore();

  // Source unique de vérité : catégories chargées depuis l'API backend
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
  const categories = categoriesData?.data ?? [];


  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const anchorId = href.replace('/#', '');
      if (location.pathname === '/') {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(href);
      }
    } else if (href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  // Liens commerciaux spéciaux (Nouveautés & Soldes)
  const newsLink = { label: 'Nouveautés', href: '/#nouveautes', accent: false };
  const saleLink = { label: 'Soldes', href: '/shop?on_sale=true', accent: true };

  // Liens dynamiques issus de la table categories
  const categoryLinks = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    href: `/shop?category=${cat.slug}`,
    accent: false,
    hasMenu: false,
  }));

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-350 ease-luxury',
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-hafrose-md border-b border-neutral-200/80'
          : 'bg-white border-b border-neutral-200/60'
      )}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden">
            <IconButton
              variant="ghost"
              size="md"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setMobileOpen(!mobileOpen)}
              icon={mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            />
          </div>

          {/* Logo */}
          <a
            href="/"
            aria-label="HAFROSE — Retour à l'accueil"
            className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-auto lg:translate-x-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 rounded-xs"
          >
            <span className="font-serif text-h3 md:text-h2 tracking-luxury-wide text-neutral-950 select-none">
              HAFROSE
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
            {/* 1. Nouveautés */}
            <div className="relative group">
              <a
                href={newsLink.href}
                onClick={(e) => handleNavClick(e, newsLink.href)}
                className="inline-flex items-center gap-1 px-3 py-2 text-body-sm font-medium tracking-wider text-neutral-700 hover:text-burgundy-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 rounded-xs"
              >
                {newsLink.label}
              </a>
            </div>

            {/* 2. Catégories dynamiques depuis l'API */}
            {isCategoriesLoading ? (
              <div className="flex items-center gap-2 px-2" aria-hidden="true">
                <div className="h-4 w-12 bg-neutral-200/60 animate-pulse rounded-xs" />
                <div className="h-4 w-14 bg-neutral-200/60 animate-pulse rounded-xs" />
                <div className="h-4 w-16 bg-neutral-200/60 animate-pulse rounded-xs" />
                <div className="h-4 w-14 bg-neutral-200/60 animate-pulse rounded-xs" />
              </div>
            ) : categoryLinks.length > 0 ? (
              categoryLinks.map((link) => (
                <div
                  key={link.id}
                  className="relative group"
                  onMouseEnter={() => link.hasMenu && setActiveMenu(link.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-body-sm font-medium tracking-wider text-neutral-700 hover:text-burgundy-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 rounded-xs"
                  >
                    {link.label}
                    {link.hasMenu && (
                      <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', activeMenu === link.label && 'rotate-180')} />
                    )}
                  </a>
                </div>
              ))
            ) : (
              <div className="relative group">
                <a
                  href="/shop"
                  onClick={(e) => handleNavClick(e, '/shop')}
                  className="inline-flex items-center gap-1 px-3 py-2 text-body-sm font-medium tracking-wider text-neutral-700 hover:text-burgundy-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 rounded-xs"
                >
                  Boutique
                </a>
              </div>
            )}

            {/* 3. Soldes */}
            <div className="relative group">
              <a
                href={saleLink.href}
                onClick={(e) => handleNavClick(e, saleLink.href)}
                className="inline-flex items-center gap-1 px-3 py-2 text-body-sm font-semibold tracking-wider text-burgundy-500 hover:text-burgundy-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 rounded-xs"
              >
                {saleLink.label}
              </a>
            </div>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-0.5 md:gap-1">
            {/* 1. Recherche */}
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Rechercher"
              onClick={onSearchOpen}
              icon={<Search className="w-5 h-5" />}
              className="hidden sm:flex"
            />

            {/* 2. Mon Compte (Navigation SPA conditionnelle : /login si visiteur, /account si connecté) */}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              aria-label="Mon compte"
              className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-700 hover:text-burgundy-500 hover:bg-rose-blush transition-all duration-200 ease-luxury focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 select-none"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* 3. Liste de souhaits */}
            <div className="relative hidden sm:block">
              <Link
                to="/wishlist"
                aria-label={`Liste de souhaits${wishlistCount > 0 ? ` (${wishlistCount} articles)` : ''}`}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-700 hover:text-burgundy-500 hover:bg-rose-blush transition-all duration-200 ease-luxury focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 select-none"
              >
                <Heart className="w-5 h-5" />
              </Link>
              {wishlistCount > 0 && (
                <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-burgundy-500 text-white text-[10px] font-bold pointer-events-none">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </div>

            {/* 4. Panier */}
            <div className="relative">
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Panier${cartCount > 0 ? ` (${cartCount} articles)` : ''}`}
                onClick={onCartOpen}
                icon={<ShoppingBag className="w-5 h-5" />}
              />
              {cartCount > 0 && (
                <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-burgundy-500 text-white text-[10px] font-bold pointer-events-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-200 animate-slide-down">
          <nav className="px-4 py-4 space-y-1" aria-label="Navigation mobile">
            {/* Nouveautés */}
            <a
              href={newsLink.href}
              className="block py-3 px-2 text-body-base font-medium border-b border-neutral-100 transition-colors duration-200 text-neutral-800 hover:text-burgundy-500"
              onClick={(e) => {
                handleNavClick(e, newsLink.href);
                setMobileOpen(false);
              }}
            >
              {newsLink.label}
            </a>

            {/* Catégories dynamiques */}
            {isCategoriesLoading ? (
              <div className="py-3 px-2 space-y-3">
                <div className="h-4 w-28 bg-neutral-200/60 animate-pulse rounded-xs" />
                <div className="h-4 w-32 bg-neutral-200/60 animate-pulse rounded-xs" />
                <div className="h-4 w-24 bg-neutral-200/60 animate-pulse rounded-xs" />
              </div>
            ) : categoryLinks.length > 0 ? (
              categoryLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="block py-3 px-2 text-body-base font-medium border-b border-neutral-100 transition-colors duration-200 text-neutral-800 hover:text-burgundy-500"
                  onClick={(e) => {
                    handleNavClick(e, link.href);
                    setMobileOpen(false);
                  }}
                >
                  {link.label}
                </a>
              ))
            ) : (
              <a
                href="/shop"
                className="block py-3 px-2 text-body-base font-medium border-b border-neutral-100 transition-colors duration-200 text-neutral-800 hover:text-burgundy-500"
                onClick={(e) => {
                  handleNavClick(e, '/shop');
                  setMobileOpen(false);
                }}
              >
                Boutique
              </a>
            )}

            {/* Soldes */}
            <a
              href={saleLink.href}
              className="block py-3 px-2 text-body-base font-semibold border-b border-neutral-100 last:border-0 transition-colors duration-200 text-burgundy-500 hover:text-burgundy-600"
              onClick={(e) => {
                handleNavClick(e, saleLink.href);
                setMobileOpen(false);
              }}
            >
              {saleLink.label}
            </a>

            <div className="pt-4 flex items-center gap-4 border-t border-neutral-200 mt-2">
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-body-sm text-neutral-600 hover:text-burgundy-500 transition-colors duration-200"
              >
                <User className="w-4 h-4" /> Mon Compte
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-body-sm text-neutral-600 hover:text-burgundy-500 transition-colors duration-200"
              >
                <Heart className="w-4 h-4" /> Favoris
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
