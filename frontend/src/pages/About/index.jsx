import { motion } from 'framer-motion';
import { FiAward, FiHeart, FiShield, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const VALUES = [
  { icon: FiAward, title: 'Excellence Artisanale', desc: 'Chaque pièce est façonnée à la main dans nos ateliers parisiens par des maîtres artisans héritiers d\'un savoir-faire séculaire.' },
  { icon: FiHeart, title: 'Matières Précieuses', desc: 'Nous sélectionnons exclusivement des cuirs pleine fleur, des métaux précieux certifiés et des pierres d\'origine éthique.' },
  { icon: FiShield, title: 'Garantie à Vie', desc: 'Chaque création Hafrose est accompagnée d\'une garantie illimitée, gage de notre confiance absolue dans notre savoir-faire.' },
  { icon: FiStar, title: 'Éditions Limitées', desc: 'Nos collections sont produites en séries limitées pour préserver le caractère exclusif de chaque création.' }
];

const MILESTONES = [
  { year: '2018', title: 'La Genèse', desc: 'Fondation de la Maison Hafrose à Paris, portée par une vision : réinventer la maroquinerie de luxe.' },
  { year: '2019', title: 'Premier Atelier', desc: 'Ouverture de notre premier atelier artisanal dans le Marais, berceau de notre savoir-faire.' },
  { year: '2021', title: 'Expansion Joaillière', desc: 'Lancement de notre collection de haute joaillerie et d\'horlogerie mécanique d\'exception.' },
  { year: '2023', title: 'Consécration', desc: 'Reconnaissance internationale avec l\'obtention du label « Entreprise du Patrimoine Vivant ».' },
  { year: '2025', title: 'L\'Ère Digitale', desc: 'Ouverture de notre écrin digital pour offrir l\'expérience Hafrose au monde entier.' }
];

export default function About() {
  useDocumentTitle('La Maison', 'L\'histoire, le savoir-faire et l\'héritage d\'excellence de la Maison Hafrose, entreprise du patrimoine vivant.');
  const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7 } };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32">
        <Breadcrumb items={[{ label: 'La Maison', path: '/about' }]} />
      </div>

      {/* Hero Banner */}
      <section className="relative h-[50vh] overflow-hidden flex items-center justify-center bg-luxury-charcoal">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
          alt="Atelier Hafrose"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <motion.div {...fadeUp} className="relative z-10 text-center space-y-6 max-w-2xl px-6">
          <span className="text-[9px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
            L'Héritage d'Excellence
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white font-light leading-tight">
            La Maison Hafrose
          </h1>
          <div className="w-16 h-[1px] bg-luxury-gold mx-auto" />
          <p className="text-sm text-white/80 font-sans font-light leading-relaxed max-w-lg mx-auto">
            Depuis sa fondation, la Maison Hafrose perpétue l'art de la maroquinerie et de la joaillerie d'exception, alliant tradition artisanale et vision contemporaine.
          </p>
        </motion.div>
      </section>

      {/* Brand Story */}
      <section className="py-24 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp} className="space-y-6 text-left">
              <span className="text-[9px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
                Notre Histoire
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-luxury-charcoal leading-tight">
                L'Art de l'Exception
              </h2>
              <div className="w-12 h-[1px] bg-luxury-gold" />
              <p className="text-sm font-sans font-light text-luxury-gray leading-relaxed">
                Hafrose est née d'une conviction profonde : le véritable luxe réside dans le mariage entre l'excellence des matières premières et la maestria des gestes artisanaux. Chaque sac, chaque bijou, chaque garde-temps qui porte notre nom est le fruit de centaines d'heures de travail minutieux.
              </p>
              <p className="text-sm font-sans font-light text-luxury-gray leading-relaxed">
                Nos maîtres artisans perpétuent des techniques héritées de générations de selliers, orfèvres et horlogers. Le cuir est tanné lentement, coupé à la main, cousu au point sellier. L'or est fondu, martelé et serti avec une précision infinie. Chaque pièce devient ainsi un chef-d'œuvre unique, porteur de l'âme de celui qui l'a créée.
              </p>
              <p className="text-sm font-sans font-light text-luxury-gray leading-relaxed">
                La Maison Hafrose ne cherche pas à suivre les tendances — elle les transcende. Notre engagement est de créer des pièces intemporelles qui traverseront les décennies et se transmettront comme des héritages précieux.
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.15 }} className="relative">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
                alt="Savoir-faire Hafrose"
                className="w-full aspect-[4/5] object-cover border border-luxury-charcoal/5"
              />
              <div className="absolute -bottom-6 -left-6 bg-luxury-charcoal text-white p-6 max-w-[200px] hidden lg:block">
                <p className="font-serif text-3xl font-light text-luxury-gold">7+</p>
                <p className="text-[9px] tracking-widest uppercase font-sans font-medium mt-1">Années d'excellence</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[9px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
              Nos Engagements
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-luxury-charcoal">Les Piliers de la Maison</h2>
            <div className="w-12 h-[1px] bg-luxury-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((val, i) => (
              <motion.div key={val.title} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }} className="text-center space-y-4 p-6 border border-luxury-charcoal/5 hover:border-luxury-gold/20 transition-colors duration-500">
                <val.icon className="mx-auto text-luxury-gold" size={28} />
                <h3 className="font-serif text-sm font-light text-luxury-charcoal">{val.title}</h3>
                <p className="text-[11px] font-sans font-light text-luxury-gray leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-luxury-charcoal text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[9px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
              Notre Parcours
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light">Les Jalons de Notre Histoire</h2>
            <div className="w-12 h-[1px] bg-luxury-gold mx-auto" />
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[1px] bg-luxury-gold/30" />
            <div className="space-y-12">
              {MILESTONES.map((ms, i) => (
                <motion.div key={ms.year} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }} className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 pl-12 md:pl-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Dot */}
                  <div className="absolute left-2.5 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-luxury-gold border-2 border-luxury-charcoal" />
                  {/* Content */}
                  <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                    <span className="font-serif text-2xl text-luxury-gold font-light">{ms.year}</span>
                    <h3 className="font-serif text-sm font-light mt-1">{ms.title}</h3>
                    <p className="text-[11px] font-sans font-light text-white/60 leading-relaxed mt-2">{ms.desc}</p>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-luxury-cream text-center">
        <motion.div {...fadeUp} className="max-w-xl mx-auto space-y-6 px-6">
          <h2 className="font-serif text-3xl font-light text-luxury-charcoal">Découvrez Nos Créations</h2>
          <p className="text-sm text-luxury-gray font-sans font-light leading-relaxed">
            Explorez notre collection d'exception et laissez-vous séduire par le savoir-faire de la Maison Hafrose.
          </p>
          <Link to="/shop">
            <Button variant="primary" className="px-10 py-3">
              Explorer la Collection
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
