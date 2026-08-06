import { Truck, Shield, Star, HeadphonesIcon } from 'lucide-react';
import { FeatureCard } from '../../../components/ui/FeatureCard';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { Grid } from '../../../components/ui/Grid';

const SERVICES = [
  {
    icon: <Truck />,
    title: 'Livraison Rapide',
    description: 'Livraison express en 24-48h partout en Europe. Gratuite dès 150€.',
    iconVariant: 'burgundy' as const,
  },
  {
    icon: <Shield />,
    title: 'Paiement Sécurisé',
    description: 'Transactions 100% sécurisées. Nous acceptons carte, virement et PayPal.',
    iconVariant: 'gold' as const,
  },
  {
    icon: <Star />,
    title: 'Qualité Premium',
    description: 'Chaque pièce est soigneusement sélectionnée pour sa qualité et son raffinement.',
    iconVariant: 'rose' as const,
  },
  {
    icon: <HeadphonesIcon />,
    title: 'Support Dédié',
    description: 'Notre équipe est disponible 7j/7 pour vous accompagner dans vos achats.',
    iconVariant: 'burgundy' as const,
  },
];

export const ServicesSection = () => (
  <Section spacing="lg" bg="white">
    <Container>
      <Grid cols={1} colsSm={2} colsLg={4} gap="md">
        {SERVICES.map((service) => (
          <FeatureCard
            key={service.title}
            icon={service.icon}
            title={service.title}
            description={service.description}
            iconVariant={service.iconVariant}
          />
        ))}
      </Grid>
    </Container>
  </Section>
);
