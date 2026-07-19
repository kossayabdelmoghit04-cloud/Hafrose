import { memo } from 'react';
import { FiCompass, FiTruck, FiAward, FiMessageCircle } from 'react-icons/fi';
import Card from '../ui/Card';

const WhyChooseUs = memo(function WhyChooseUs() {
  const assets = [
    {
      icon: <FiCompass className="text-luxury-gold" size={28} />,
      title: "Savoir-Faire Unique",
      desc: "Chaque pièce est entièrement façonnée et assemblée à la main dans nos ateliers partenaires par des artisans passionnés."
    },
    {
      icon: <FiTruck className="text-luxury-gold" size={28} />,
      title: "Expédition Assurée",
      desc: "Livraison sécurisée avec signature et écrin signature offert. Emballage soigné préservant la perfection de vos pièces."
    },
    {
      icon: <FiAward className="text-luxury-gold" size={28} />,
      title: "Matières Certifiées",
      desc: "Sélection rigoureuse des cuirs, métaux et pierres. Certificat d'authenticité et numéro de série unique pour chaque création."
    },
    {
      icon: <FiMessageCircle className="text-luxury-gold" size={28} />,
      title: "Service Conciergerie",
      desc: "Nos conseillers sont à votre entière disposition 24/7 pour répondre à vos questions et organiser vos visites privées."
    }
  ];

  return (
    <section className="py-24 bg-luxury-charcoal text-luxury-cream border-t border-luxury-gold/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
            L'Engagement de la Maison
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-white font-light">
            Pourquoi Choisir Hafrose
          </h2>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto" />
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {assets.map((item, idx) => (
            <Card
              key={item.title}
              variant="flat"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 text-center group bg-transparent text-luxury-cream shadow-none border-0 p-0"
            >
              <div className="w-16 h-16 rounded-full border border-luxury-gold/20 flex items-center justify-center mx-auto group-hover:border-luxury-gold/50 transition-colors duration-500">
                {item.icon}
              </div>
              <Card.Title as="h3" className="text-white text-lg font-light">
                {item.title}
              </Card.Title>
              <Card.Description className="text-xs text-luxury-cream/60 leading-relaxed max-w-xs mx-auto">
                {item.desc}
              </Card.Description>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
});

export default WhyChooseUs;

