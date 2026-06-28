import Hero from '../../components/sections/Hero';
import MaisonPresentation from '../../components/sections/MaisonPresentation';
import PopularCategories from '../../components/sections/PopularCategories';
import FeaturedProducts from '../../components/sections/FeaturedProducts';
import WhyChooseUs from '../../components/sections/WhyChooseUs';
import Testimonials from '../../components/sections/Testimonials';
import Newsletter from '../../components/sections/Newsletter';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle(
    'Accueil',
    'Maison Hafrose — Haute Maroquinerie, Joaillerie Fine et Horlogerie d\'Exception. Découvrez nos créations artisanales façonnées avec des matières nobles.'
  );

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
