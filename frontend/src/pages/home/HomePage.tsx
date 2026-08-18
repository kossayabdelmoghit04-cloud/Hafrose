import { useSEO, useJsonLD } from '../../hooks/useSEO';
import { buildWebSiteLD, buildOrganizationLD, SITE_DESCRIPTION } from '../../utils/seo';
import { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCategories } from '../../hooks/useProductHooks';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { NewArrivalsSection } from './sections/NewArrivalsSection';
import { CategoryProductSection } from './sections/CategoryProductSection';
import { BestSellersSection } from './sections/BestSellersSection';
import { NewCollectionSection } from './sections/NewCollectionSection';
import { PromotionalBannerSection } from './sections/PromotionalBannerSection';
import { NewsletterSection } from './sections/NewsletterSection';

/**
 * HomePage — HAFROSE Landing Experience
 * Header, Footer, AnnouncementBar and global drawers are provided by PublicLayout.
 * This component renders only the page-specific content sections.
 */
export const HomePage = () => {
  const location = useLocation();

  // Source unique de vérité : catégories chargées depuis l'API backend
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

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

  // ── Smooth Hash Scrolling (e.g. #nouveautes, #sacs, #bijoux) ───────────────
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

      {/* 5. Dynamic Category Product Sections (Source unique de vérité DB) */}
      {categories.map((category, index) => (
        <CategoryProductSection
          key={category.id}
          id={category.slug}
          categorySlug={category.slug}
          categoryName={category.name}
          limit={4}
          bg={index % 2 === 0 ? 'cream' : 'white'}
        />
      ))}

      {/* 6. Best Sellers Section */}
      <BestSellersSection />

      {/* 7. New Collection Editorial Section */}
      <NewCollectionSection />

      {/* 8. Promotional Banner Section */}
      <PromotionalBannerSection />

      {/* 9. Newsletter Section */}
      <NewsletterSection />
    </>
  );
};

export default HomePage;
