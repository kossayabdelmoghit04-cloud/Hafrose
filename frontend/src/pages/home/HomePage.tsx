import { useSEO, useJsonLD } from '../../hooks/useSEO';
import { buildWebSiteLD, buildOrganizationLD, SITE_DESCRIPTION } from '../../utils/seo';
import { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { NewArrivalsSection } from './sections/NewArrivalsSection';
import { CategoryProductSection } from './sections/CategoryProductSection';
import { BestSellersSection } from './sections/BestSellersSection';
import { NewCollectionSection } from './sections/NewCollectionSection';
import { PromotionalBannerSection } from './sections/PromotionalBannerSection';
import { InstagramInspirationSection } from './sections/InstagramInspirationSection';
import { NewsletterSection } from './sections/NewsletterSection';

/**
 * HomePage — HAFROSE Landing Experience
 * Header, Footer, AnnouncementBar and global drawers are provided by PublicLayout.
 * This component renders only the page-specific content sections.
 */
export const HomePage = () => {
  const location = useLocation();

  // ── SEO ────────────────────────────────────────────────────────────────────
  useSEO({
    title: 'HAFROSE — Maison de Luxe | Mode Féminine Premium',
    description: SITE_DESCRIPTION,
    ogType: 'website',
    canonical: 'https://hafrose.com/',
  });

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationLD(),
      buildWebSiteLD(),
    ],
  }), []);

  useJsonLD(jsonLd);

  // ── Smooth Hash Scrolling (e.g. #nouveautes, #robes, #sacs) ───────────────
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        const timeout = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [location.hash]);

  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Services Section */}
      <ServicesSection />

      {/* 3. Categories Discovery Section */}
      <CategoriesSection />

      {/* 4. New Arrivals Section (Nouveautés) */}
      <NewArrivalsSection />

      {/* 5. Category: Robes */}
      <CategoryProductSection
        id="robes"
        categorySlug="robes"
        categoryName="Robes"
        tagline="Silhouettes Emblématiques"
        subtitle="Coupes couture fluides et matières nobles façonnées pour sublimer chaque silhouette."
        ctaText="Voir toutes les robes"
        limit={8}
        bg="cream"
      />

      {/* 6. Category: Sacs */}
      <CategoryProductSection
        id="sacs"
        categorySlug="sacs"
        categoryName="Sacs"
        tagline="Haute Maroquinerie"
        subtitle="Sacs à main, cabas et pochettes façonnés dans des cuirs d'exception."
        ctaText="Voir tous les sacs"
        limit={8}
        bg="white"
      />

      {/* 7. Category: Chaussures */}
      <CategoryProductSection
        id="chaussures"
        categorySlug="chaussures"
        categoryName="Chaussures"
        tagline="Allure & Confort"
        subtitle="Escarpins, bottines et sandales alliant démarche gracieuse et finitions artisanales."
        ctaText="Voir toutes les chaussures"
        limit={8}
        bg="cream"
      />

      {/* 8. Category: Bijoux */}
      <CategoryProductSection
        id="bijoux"
        categorySlug="bijoux"
        categoryName="Bijoux"
        tagline="Créations Précieuses"
        subtitle="Bijoux dorés à l'or fin et pièces scintillantes pour magnifier chaque tenue."
        ctaText="Voir tous les bijoux"
        limit={8}
        bg="white"
      />

      {/* 9. Best Sellers Section */}
      <BestSellersSection />

      {/* 10. New Collection Editorial Section */}
      <NewCollectionSection />

      {/* 11. Promotional Banner Section */}
      <PromotionalBannerSection />

      {/* 12. Instagram Inspiration Section */}
      <InstagramInspirationSection />

      {/* 13. Newsletter Section */}
      <NewsletterSection />
    </>
  );
};

export default HomePage;

