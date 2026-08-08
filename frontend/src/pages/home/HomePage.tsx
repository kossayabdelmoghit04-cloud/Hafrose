import { useSEO, useJsonLD } from '../../hooks/useSEO';
import { buildWebSiteLD, buildOrganizationLD, SITE_DESCRIPTION } from '../../utils/seo';
import { useMemo } from 'react';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { CategoriesSection } from './sections/CategoriesSection';
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

  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Services Section */}
      <ServicesSection />

      {/* 3. Categories Section */}
      <CategoriesSection />

      {/* 4. Best Sellers Section */}
      <BestSellersSection />

      {/* 5. New Collection Section */}
      <NewCollectionSection />

      {/* 6. Promotional Banner Section */}
      <PromotionalBannerSection />

      {/* 7. Instagram Inspiration Section */}
      <InstagramInspirationSection />

      {/* 8. Newsletter Section */}
      <NewsletterSection />
    </>
  );
};

export default HomePage;
