import { motion } from 'framer-motion';

export default function Testimonials() {
  const reviews = [
    {
      author: "Hélène de M.",
      city: "Genève",
      comment: "Le cabas en cuir d'autruche est un chef-d'œuvre. La patine, la précision de la couture sellier et l'élégance qu'il dégage sont incomparables. C'est mon compagnon de voyage privilégié.",
      rating: 5
    },
    {
      author: "Julien R.",
      city: "Paris",
      comment: "J'ai acquis le chronographe automatique Héritage. Une merveille d'horlogerie. Le mouvement squelette est captivant et le service de la conciergerie a été irréprochable.",
      rating: 5
    },
    {
      author: "Clara B.",
      city: "Londres",
      comment: "Le collier en or blanc orné du diamant de synthèse est d'une pureté absolue. Le service client m'a accompagnée avec un soin particulier. Hafrose est devenue ma maison préférée.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-luxury-cream border-t border-luxury-charcoal/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
            Échos des Esthètes
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-luxury-charcoal font-light">
            Les Témoignages
          </h2>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between bg-luxury-light-gray/25 p-8 border border-luxury-charcoal/5 relative"
            >
              {/* Rating stars */}
              <div className="text-luxury-gold text-xs tracking-wider mb-6">
                {"★".repeat(rev.rating)}
              </div>

              {/* Quote */}
              <p className="text-sm font-sans font-light italic leading-relaxed text-luxury-gray mb-8">
                "{rev.comment}"
              </p>

              {/* Author Info */}
              <div className="border-t border-luxury-charcoal/5 pt-4">
                <h4 className="font-serif text-sm font-medium text-luxury-charcoal">
                  {rev.author}
                </h4>
                <p className="text-[10px] tracking-wider uppercase text-luxury-gold font-sans font-light">
                  {rev.city}
                </p>
              </div>

              {/* Subtle top quotation mark decorator */}
              <span className="absolute top-4 right-6 text-7xl font-serif text-luxury-gold/5 font-extralight pointer-events-none select-none">
                ”
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
