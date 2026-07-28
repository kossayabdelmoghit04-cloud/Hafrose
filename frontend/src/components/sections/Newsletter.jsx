import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { Form, EmailField } from '../ui/form';
import Button from '../ui/Button';
import { scrollRevealProps, staggerContainer, fadeUp } from '../../utils/motionConfig';

const Newsletter = memo(function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section
      className="relative py-28 overflow-hidden"
      aria-label="Inscription newsletter Hafrose"
    >
      {/* Full-width dark bg */}
      <div className="absolute inset-0 bg-luxury-charcoal" />

      {/* Gold gradient accent top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(196,168,130,0.5) 50%, transparent)' }}
        aria-hidden="true"
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 50% 80% at 50% 50%, rgba(196,168,130,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.12, 0.1)}
          className="space-y-8"
        >
          {/* Decorative lines + overline */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-6">
            <span className="h-[1px] bg-luxury-gold/30 w-12 block" aria-hidden="true" />
            <span className="text-overline">Privilège Exclusif</span>
            <span className="h-[1px] bg-luxury-gold/30 w-12 block" aria-hidden="true" />
          </motion.div>

          {/* Heading */}
          <motion.h2 variants={fadeUp} className="text-fluid-h2 text-white font-extralight">
            Recevez nos<br />
            <em className="text-luxury-gold not-italic">invitations privées</em>
          </motion.h2>

          {/* Divider */}
          <motion.div variants={fadeUp} className="h-[1px] bg-luxury-gold/30 w-12 mx-auto" />

          {/* Body */}
          <motion.p variants={fadeUp} className="text-luxury-cream/55 font-sans font-light leading-relaxed text-sm max-w-md mx-auto">
            Inscrivez-vous pour être parmi les premiers informés de nos nouvelles collections,
            ventes privées et événements exclusifs réservés aux membres de la Maison Hafrose.
          </motion.p>

          {/* Form */}
          <motion.div variants={fadeUp}>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
                  className="inline-flex items-center gap-3 py-4 px-6 glass-card-dark"
                  role="status"
                  aria-live="polite"
                >
                  <span className="w-5 h-5 rounded-full bg-luxury-gold/20 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-luxury-gold" size={11} />
                  </span>
                  <span className="text-luxury-cream/80 text-xs font-sans font-light tracking-wide">
                    Merci. Bienvenue dans l'univers Hafrose.
                  </span>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }}>
                  <Form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
                    aria-label="Formulaire d'inscription newsletter"
                  >
                    <Form.Field name="newsletter-email" className="flex-grow space-y-0">
                      <Form.Label className="sr-only">Votre adresse email</Form.Label>
                      <EmailField
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Votre adresse email"
                        required
                        variant="client"
                        size="md"
                        autoComplete="email"
                        className="bg-luxury-cream/10 border-luxury-cream/20 text-luxury-cream placeholder:text-luxury-cream/30 focus:border-luxury-gold"
                      />
                    </Form.Field>

                    <Button
                      type="submit"
                      variant="luxury"
                      size="md"
                      icon={<FiArrowRight size={12} />}
                      iconPosition="right"
                      className="btn-ripple whitespace-nowrap flex-shrink-0 sm:w-auto w-full"
                    >
                      S'inscrire
                    </Button>
                  </Form>

                  {/* Privacy note */}
                  <p className="mt-4 text-[9px] tracking-[0.2em] uppercase text-luxury-cream/25 font-sans">
                    Aucun spam. Désabonnement en un clic.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>

      {/* Bottom gold line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(196,168,130,0.5) 50%, transparent)' }}
        aria-hidden="true"
      />
    </section>
  );
});

export default Newsletter;
