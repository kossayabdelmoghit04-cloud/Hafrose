import promoBannerImg from '../../../assets/images/promo-banner.jpg';
import { BannerCard } from '../../../components/ui/BannerCard';
import { Button } from '../../../components/ui/Button';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';

export const PromotionalBannerSection = () => (
  <Section spacing="lg" bg="cream">
    <Container>
      <BannerCard
        title="Ventes Privées d'Été"
        subtitle="Offre Exclusive Membres"
        description="Bénéficiez de jusqu'à -30% sur une sélection exclusive de pièces de haute maroquinerie et robes de soirée."
        imageUrl={promoBannerImg}
        badgeText="Jusqu'au 20 Août"
        align="left"
        cta={
          <Button variant="primary" size="lg">
            Profiter de l'Offre Privée
          </Button>
        }
      />
    </Container>
  </Section>
);
