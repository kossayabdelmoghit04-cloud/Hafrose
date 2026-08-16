import { useNavigate } from 'react-router-dom';
import { BannerCard } from '../../../components/ui/BannerCard';
import { Button } from '../../../components/ui/Button';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { useHomeData } from '../../../hooks/useHomeHooks';
import { getImageUrl } from '../../../utils/formatters';

export const PromotionalBannerSection = () => {
  const navigate = useNavigate();
  const { data } = useHomeData();
  const promo = data?.data?.promo;

  const badge = promo?.badge ?? "Jusqu'au 20 Août";
  const title = promo?.title ?? "Ventes Privées d'Été";
  const subtitle = promo?.subtitle ?? 'Offre Exclusive Membres';
  const description = promo?.description ?? "Bénéficiez de jusqu'à -30% sur une sélection exclusive de pièces de haute maroquinerie et robes de soirée.";
  const btnText = promo?.btn_text ?? "Profiter de l'Offre Privée";
  const btnUrl = promo?.btn_url ?? '/shop';

  // Image résolue côté serveur — aucun import statique d'asset métier
  const imageUrl = promo?.image_url
    ? getImageUrl(promo.image_url)
    : `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 500'><rect width='1200' height='500' fill='%234a1532'/></svg>`;

  return (
    <Section spacing="lg" bg="cream">
      <Container>
        <BannerCard
          title={title}
          subtitle={subtitle}
          description={description}
          imageUrl={imageUrl}
          badgeText={badge}
          align="left"
          cta={
            <Button variant="primary" size="lg" onClick={() => navigate(btnUrl)}>
              {btnText}
            </Button>
          }
        />
      </Container>
    </Section>
  );
};

