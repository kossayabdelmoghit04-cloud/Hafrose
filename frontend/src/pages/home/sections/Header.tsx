import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { IconButton } from '../../../components/ui/IconButton';
import { cn } from '../../../utils/cn';

const NAV_LINKS = [
  { label: 'Nouveautés', href: '/#nouveautes', hasMenu: false },
  { label: 'Robes', href: '/#robes', hasMenu: false },
  { label: 'Sacs', href: '/#sacs', hasMenu: false },
  { label: 'Chaussures', href: '/#chaussures', hasMenu: false },
  { label: 'Bijoux', href: '/#bijoux', hasMenu: false },
  { label: 'Soldes', href: '/shop', hasMenu: false, accent: true },
];

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
    }
  };

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
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative group"
                onMouseEnter={() => link.hasMenu && setActiveMenu(link.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-2 text-body-sm font-medium tracking-wider transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 rounded-xs',
                    link.accent ? 'text-burgundy-500 font-semibold' : 'text-neutral-700 hover:text-burgundy-500'
                  )}
                >
                  {link.label}
                  {link.hasMenu && (
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', activeMenu === link.label && 'rotate-180')} />
                  )}
                </a>
              </div>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Rechercher"
              onClick={onSearchOpen}
              icon={<Search className="w-5 h-5" />}
              className="hidden sm:flex"
            />

            <a href="/account" aria-label="Mon compte" className="hidden sm:flex">
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="Mon compte"
                icon={<User className="w-5 h-5" />}
              />
            </a>

            <div className="relative hidden sm:block">
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Liste de souhaits${wishlistCount > 0 ? ` (${wishlistCount} articles)` : ''}`}
                icon={<Heart className="w-5 h-5" />}
              />
              {wishlistCount > 0 && (
                <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-burgundy-500 text-white text-[10px] font-bold">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </div>

            <div className="relative">
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Panier${cartCount > 0 ? ` (${cartCount} articles)` : ''}`}
                onClick={onCartOpen}
                icon={<ShoppingBag className="w-5 h-5" />}
              />
              {cartCount > 0 && (
                <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-burgundy-500 text-white text-[10px] font-bold">
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
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'block py-3 px-2 text-body-base font-medium border-b border-neutral-100 last:border-0 transition-colors duration-200',
                  link.accent ? 'text-burgundy-500' : 'text-neutral-800 hover:text-burgundy-500'
                )}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setMobileOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 flex items-center gap-4 border-t border-neutral-200 mt-2">
              <a href="/account" className="flex items-center gap-2 text-body-sm text-neutral-600 hover:text-burgundy-500 transition-colors duration-200">
                <User className="w-4 h-4" /> Mon Compte
              </a>
              <a href="/wishlist" className="flex items-center gap-2 text-body-sm text-neutral-600 hover:text-burgundy-500 transition-colors duration-200">
                <Heart className="w-4 h-4" /> Favoris
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

