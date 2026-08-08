import heroImage from '../../../assets/images/hero-main.png';
import { Button } from '../../../components/ui/Button';
import { LinkButton } from '../../../components/ui/LinkButton';
import { LazyImage } from '../../../components/ui/LazyImage';

export const HeroSection = () => (
  <section
    className="relative w-full min-h-screen flex items-end md:items-center overflow-hidden bg-cream-200"
    aria-label="Collection HAFROSE"
  >
    {/* Background Image — priority LCP candidate */}
    <div className="absolute inset-0">
      <LazyImage
        src={heroImage}
        alt="Silhouette élégante HAFROSE — Collection Printemps"
        className="w-full h-full object-cover object-top"
        wrapperClassName="w-full h-full"
        objectFit="cover"
        priority
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-neutral-950/10 md:bg-gradient-to-r md:from-neutral-950/70 md:via-neutral-950/30 md:to-transparent" />
    </div>

    {/* Content */}
    <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-0">
      <div className="max-w-xl py-12">
        {/* Label */}
        <p className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-rose-300 mb-4 animate-fade-in">
          Collection Printemps — Été 2025
        </p>

        {/* Main Title */}
        <h1 className="font-serif text-display-lg md:text-display-xl text-white leading-tight mb-6 animate-slide-up">
          L'Art de la
          <span className="block italic text-rose-300">Féminité</span>
        </h1>

        {/* Subtitle */}
        <p className="text-body-lg text-white/80 leading-relaxed mb-8 max-w-md animate-slide-up">
          Découvrez une collection pensée pour la femme moderne — alliant élégance intemporelle et féminité affirmée.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 animate-slide-up">
          <Button variant="primary" size="lg">
            Découvrir la Collection
          </Button>
          <LinkButton
            href="/catalog"
            variant="outline"
            size="lg"
            className="border-white/70 text-white hover:bg-white hover:text-burgundy-700"
          >
            Voir tout
          </LinkButton>
        </div>
      </div>
    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/60 animate-float">
      <span className="text-caption tracking-luxury">DÉFILER</span>
      <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
    </div>
  </section>
);
