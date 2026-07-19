import Hero from '../../components/sections/Hero';
import MaisonPresentation from '../../components/sections/MaisonPresentation';
import PopularCategories from '../../components/sections/PopularCategories';
import FeaturedProducts from '../../components/sections/FeaturedProducts';
import WhyChooseUs from '../../components/sections/WhyChooseUs';
import Testimonials from '../../components/sections/Testimonials';
import Newsletter from '../../components/sections/Newsletter';
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
      {/* 1. Hero — Immersive fullscreen introduction */}
      <Hero />

      {/* 2. Présentation de la Maison Hafrose */}
      <MaisonPresentation />

      {/* 3. Catégories populaires */}
      <PopularCategories />

      {/* 4. Produits vedettes */}
      <FeaturedProducts />

      {/* 5. Pourquoi choisir Hafrose */}
      <WhyChooseUs />

      {/* 6. Témoignages clients */}
      <Testimonials />

      {/* 7. Newsletter */}
      <Newsletter />
    </>
  );
}
