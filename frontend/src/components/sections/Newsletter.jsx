import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      // Future: connect to newsletter API or SweetAlert
    }
  };

  return (
    <section className="py-24 bg-luxury-light-gray/30 border-t border-luxury-charcoal/5">
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <span className="text-[10px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
            Privilège Exclusif
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-luxury-charcoal font-light leading-tight">
            Recevez nos invitations privées
          </h2>
          <p className="text-sm text-luxury-gray font-sans font-light leading-relaxed max-w-lg mx-auto">
            Inscrivez-vous pour être le premier informé de nos nouvelles collections, ventes privées et événements exclusifs réservés aux membres de la Maison Hafrose.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6"
            >
              <div className="inline-flex items-center gap-2 text-sm text-luxury-gold font-sans font-medium tracking-wider">
                <span className="w-5 h-5 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold text-xs">✓</span>
                Merci pour votre inscription. Bienvenue dans l'univers Hafrose.
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 mt-8 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                className="w-full bg-transparent border-b border-luxury-charcoal/15 text-sm py-3 focus:outline-none focus:border-luxury-gold text-luxury-charcoal placeholder-luxury-gray/50 tracking-wider font-sans transition-all duration-300"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="shrink-0 bg-luxury-charcoal text-luxury-cream text-[10px] tracking-[0.3em] uppercase py-3.5 px-8 hover:bg-luxury-gold transition-colors duration-300 font-sans font-medium cursor-pointer flex items-center gap-2"
              >
                S'inscrire
                <FiArrowRight size={12} />
              </motion.button>
            </form>
          )}
        </motion.div>

      </div>
    </section>
  );
}
