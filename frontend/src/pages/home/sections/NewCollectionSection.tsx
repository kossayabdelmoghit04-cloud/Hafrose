import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { LazyImage } from '../../../components/ui/LazyImage';
import { useHomeData } from '../../../hooks/useHomeHooks';
import { getImageUrl } from '../../../utils/formatters';

export const NewCollectionSection = () => {
  const navigate = useNavigate();
  const { data } = useHomeData();
  const ed = data?.data?.editorial;

  const badge = ed?.badge ?? 'Édition Limitée';
  const title = ed?.title ?? 'La Collection Symphonie Rose';
  const description = ed?.description ?? "Inspirée par la douceur de l'aube et l'élégance des lignes parisiennes, la collection Symphonie Rose célèbre une féminité affirmée, moderne et intemporelle.";
  const quote = ed?.quote ?? "« Chaque couture est pensée comme une œuvre d'art, où le confort rencontre l'extrême raffinement. »";
  const btnText = ed?.btn_text ?? 'Explorer la Collection';
  const btnUrl = ed?.btn_url ?? '/shop';
  const badgeDetailTitle = ed?.badge_detail_title ?? 'Savoir-Faire Artisanal';
  const badgeDetailText = ed?.badge_detail_text ?? 'Soie naturelle & finitions cousues main dans nos ateliers.';

  // Image résolue côté serveur — aucun import statique d'asset métier
  const imageSrc = ed?.image_url
    ? getImageUrl(ed.image_url)
    : `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'><rect width='800' height='600' fill='%234a1532'/></svg>`;

  return (
    <Section spacing="xl" bg="white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Editorial Text Block */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <span className="inline-flex items-center px-3 py-1 rounded-xs text-badge font-sans font-semibold tracking-luxury uppercase bg-burgundy-50 text-burgundy-700 border border-burgundy-100">
              {badge}
            </span>
            <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950 leading-tight">
              {title.includes('Symphonie') ? (
                <>
                  La Collection <br />
                  <span className="italic text-burgundy-500 font-serif">Symphonie Rose</span>
                </>
              ) : (
                title
              )}
            </h2>
            <p className="text-body-base text-neutral-600 leading-relaxed">
              {description}
            </p>
            <p className="text-body-sm text-neutral-500 italic">
              {quote}
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg" onClick={() => navigate(btnUrl)}>
                {btnText}
              </Button>
            </div>
          </div>

          {/* Asymmetric Image Block */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative">
            <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden shadow-hafrose-lg group">
              <LazyImage
                src={imageSrc}
                alt="Maison HAFROSE — Collection Éditoriale"
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                wrapperClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Luxury Detail Box */}
            <div className="absolute -bottom-6 -left-6 hidden sm:block bg-white p-5 rounded-md shadow-hafrose-card border border-rose-powder/60 max-w-xs animate-float">
              <span className="text-caption font-sans font-semibold tracking-luxury uppercase text-gold-700 block mb-1">
                {badgeDetailTitle}
              </span>
              <p className="text-body-sm font-serif text-neutral-900 font-medium">
                {badgeDetailText}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};


