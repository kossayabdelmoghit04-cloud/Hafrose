import Hero from '../../components/sections/Hero';
import MaisonPresentation from '../../components/sections/MaisonPresentation';
import PopularCategories from '../../components/sections/PopularCategories';
import FeaturedProducts from '../../components/sections/FeaturedProducts';
import WhyChooseUs from '../../components/sections/WhyChooseUs';
import Testimonials from '../../components/sections/Testimonials';
import Newsletter from '../../components/sections/Newsletter';
import LookbookBanner from '../../components/sections/LookbookBanner';
import ArtisanatSection from '../../components/sections/ArtisanatSection';
import LuxuryBanner from '../../components/sections/LuxuryBanner';
import EditorialJournal from '../../components/sections/EditorialJournal';
import RecentlyViewedSection from '../../components/sections/RecentlyViewedSection';
import TrustCertificates from '../../components/sections/TrustCertificates';
import useSEO from '../../hooks/useSEO';

const HOME_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Maison Hafrose',
    url: 'https://hafrose.com',
    logo: 'https://hafrose.com/favicon.svg',
    description: "Haute Maroquinerie, Joaillerie Fine et Horlogerie d'Exception artisanales.",
    foundingDate: '2018',
    foundingLocation: 'Paris, France',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '12 Rue du Faubourg Saint-Honoré',
      addressLocality: 'Paris',
      postalCode: '75008',
      addressCountry: 'FR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@hafrose.com',
      contactType: 'customer service',
      availableLanguage: 'French',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hafrose',
    url: 'https://hafrose.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://hafrose.com/shop?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
];

export default function Home() {
  useSEO({
    title: 'Accueil',
    description:
      "Maison Hafrose — Haute Maroquinerie, Joaillerie Fine et Horlogerie d'Exception. Découvrez nos créations artisanales façonnées avec des matières nobles.",
    canonical: 'https://hafrose.com/',
    ogImage: 'https://hafrose.com/og-default.jpg',
    schema: HOME_SCHEMA,
  });

  return (
    <>
      {/* 1. Hero — Immersive parallax introduction */}
      <Hero />

      {/* 2. Présentation de la Maison Hafrose */}
      <MaisonPresentation />

      {/* 3. Lookbook Banner — Editorial cinematic section */}
      <LookbookBanner />

      {/* 4. Catégories populaires */}
      <PopularCategories />

      {/* 5. Produits vedettes */}
      <FeaturedProducts />

      {/* 6. L'Artisanat — Storytelling + counters */}
      <ArtisanatSection />

      {/* 7. Journal & Magazine de la Maison (Phase 8.8 Editorial) */}
      <EditorialJournal />

      {/* 8. Pourquoi choisir Hafrose */}
      <WhyChooseUs />

      {/* 9. Garantie & Traçabilité (Phase 8.5 Trust) */}
      <TrustCertificates />

      {/* 10. Témoignages — Carousel autoplay */}
      <Testimonials />

      {/* 11. Produits vus récemment (Phase 8.1 Personalization) */}
      <RecentlyViewedSection />

      {/* 12. Luxury Banner — CTA signature */}
      <LuxuryBanner />

      {/* 13. Newsletter — Premium dark section */}
      <Newsletter />
    </>
  );
}
