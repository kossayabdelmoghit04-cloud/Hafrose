import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { LinkButton } from '../../../components/ui/LinkButton';
import { LazyImage } from '../../../components/ui/LazyImage';
import { useHomeData } from '../../../hooks/useHomeHooks';
import { getImageUrl } from '../../../utils/formatters';

// SVG fallback luxe inline — jamais de chemin hardcodé vers les assets métier
const HERO_FALLBACK_SVG = `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'><rect width='1920' height='1080' fill='%234a1532'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='72' fill='%23f5e6d0' opacity='0.3'>HAFROSE</text></svg>`;

export const HeroSection = () => {
  const { data } = useHomeData();
  const hero = data?.data?.hero;

  // URLs résolues côté serveur — jamais d'import statique d'asset métier
  const imageSrc = hero?.image_url
    ? getImageUrl(hero.image_url)
    : HERO_FALLBACK_SVG;

  const eyebrow = hero?.eyebrow ?? 'Collection Printemps — Été 2025';
  const title = hero?.title ?? "L'Art de la Féminité";
  const description = hero?.description ?? 'Découvrez une collection pensée pour la femme moderne — alliant élégance intemporelle et féminité affirmée.';
  const primaryBtnText = hero?.primary_btn_text ?? 'Découvrir la Collection';
  const primaryBtnUrl = hero?.primary_btn_url ?? '/shop';
  const secondaryBtnText = hero?.secondary_btn_text ?? 'Voir tout';
  const secondaryBtnUrl = hero?.secondary_btn_url ?? '/shop';

  return (
    <section
      className="relative w-full min-h-screen flex items-end md:items-center overflow-hidden bg-cream-200"
      aria-label="Collection HAFROSE"
    >
      {/* Background Image — priority LCP candidate */}
      <div className="absolute inset-0">
        <LazyImage
          src={imageSrc}
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
            {eyebrow}
          </p>

          {/* Main Title */}
          <h1 className="font-serif text-display-lg md:text-display-xl text-white leading-tight mb-6 animate-slide-up">
            {title.split(/\s+/).slice(0, -1).join(' ')}
            <span className="block italic text-rose-300">
              {title.split(/\s+/).at(-1)}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-white/80 leading-relaxed mb-8 max-w-md animate-slide-up">
            {description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 animate-slide-up">
            <Link to={primaryBtnUrl}>
              <Button variant="primary" size="lg">
                {primaryBtnText}
              </Button>
            </Link>
            <LinkButton
              href={secondaryBtnUrl}
              variant="outline"
              size="lg"
              className="border-white/70 text-white hover:bg-white hover:text-burgundy-700"
            >
              {secondaryBtnText}
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
};

