import { Instagram, Facebook, Twitter, Heart } from 'lucide-react';
import { Container } from '../../../components/ui/Container';
import { Divider } from '../../../components/ui/Divider';
import { useCategories } from '../../../hooks/useProductHooks';

export const Footer = () => {
  // Source unique de vérité : catégories chargées depuis l'API backend
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  const boutiqueLinks = [
    { label: 'Nouveautés', href: '/#nouveautes' },
    ...(categories.length > 0
      ? categories.map((cat) => ({
          label: cat.name,
          href: `/shop?category=${cat.slug}`,
        }))
      : [{ label: 'Boutique', href: '/shop' }]),
    { label: 'Soldes & Promotions', href: '/shop?on_sale=true' },
  ];

  return (
    <footer className="bg-neutral-950 text-neutral-400 pt-10 pb-6 border-t border-neutral-900" aria-label="Pied de page">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-3">
            <a href="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-xs">
              <span className="font-serif text-h3 tracking-luxury-wide text-white">
                HAFROSE
              </span>
            </a>
            <p className="text-body-sm text-neutral-400 max-w-sm leading-relaxed">
              Maison de haute couture féminine incarnant l'élégance parisienne, le raffinement des matières et la modernité des silhouettes.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez HAFROSE sur Instagram"
                className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-burgundy-500 transition-all duration-200"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez HAFROSE sur Facebook"
                className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-burgundy-500 transition-all duration-200"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez HAFROSE sur Twitter"
                className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-burgundy-500 transition-all duration-200"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Links Column: Boutique (Dynamic from API) */}
          <div className="space-y-2.5">
            <h4 className="font-serif text-body-base text-white tracking-wide font-medium">Boutique</h4>
            <ul className="space-y-1.5 text-body-sm">
              {boutiqueLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-rose-300 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Divider spacing="none" className="border-neutral-900" />

        {/* Bottom Bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption text-neutral-500">
          <p>© {new Date().getFullYear()} HAFROSE Paris. Tous droits réservés.</p>
          <div className="flex items-center gap-1">
            <span>Fait avec</span>
            <Heart className="w-3 h-3 text-burgundy-500 fill-burgundy-500 inline" />
            <span>à Paris</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
