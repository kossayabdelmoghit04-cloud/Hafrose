import newCollectionImg from '../../../assets/images/new-collection.jpg';
import { Button } from '../../../components/ui/Button';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';

export const NewCollectionSection = () => (
  <Section spacing="xl" bg="white">
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Editorial Text Block */}
        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
          <span className="inline-flex items-center px-3 py-1 rounded-xs text-badge font-sans font-semibold tracking-luxury uppercase bg-burgundy-50 text-burgundy-700 border border-burgundy-100">
            Édition Limitée
          </span>
          <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950 leading-tight">
            La Collection <br />
            <span className="italic text-burgundy-500 font-serif">Symphonie Rose</span>
          </h2>
          <p className="text-body-base text-neutral-600 leading-relaxed">
            Inspirée par la douceur de l'aube et l'élégance des lignes parisiennes, la collection Symphonie Rose célèbre une féminité affirmée, moderne et intemporelle.
          </p>
          <p className="text-body-sm text-neutral-500 italic">
            « Chaque couture est pensée comme une œuvre d'art, où le confort rencontre l'extrême raffinement. »
          </p>
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg">
              Explorer le Lookbook
            </Button>
          </div>
        </div>

        {/* Asymmetric Image Block */}
        <div className="lg:col-span-7 order-1 lg:order-2 relative">
          <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden shadow-hafrose-lg group">
            <img
              src={newCollectionImg}
              alt="Maison HAFROSE — Collection Symphonie Rose"
              className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent" />
          </div>

          {/* Floating Luxury Detail Box */}
          <div className="absolute -bottom-6 -left-6 hidden sm:block bg-white p-5 rounded-md shadow-hafrose-card border border-rose-powder/60 max-w-xs animate-float">
            <span className="text-caption font-sans font-semibold tracking-luxury uppercase text-gold-700 block mb-1">
              Savoir-Faire Artisanal
            </span>
            <p className="text-body-sm font-serif text-neutral-900 font-medium">
              Soie naturelle & finitions cousues main dans nos ateliers.
            </p>
          </div>
        </div>
      </div>
    </Container>
  </Section>
);
