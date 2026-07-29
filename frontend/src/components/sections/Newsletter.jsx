import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Form, EmailField } from '../ui/form';
import Button from '../ui/Button';
import { scrollRevealProps, staggerContainer, fadeUp, revealLine } from '../../utils/motionConfig';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Newsletter = memo(function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = useCallback((val) => {
    if (!val || !val.trim()) {
      return 'Veuillez renseigner votre adresse email.';
    }
    if (!EMAIL_REGEX.test(val.trim())) {
      return 'Veuillez saisir une adresse email valide.';
    }
    return '';
  }, []);

  const handleBlur = () => {
    if (email) {
      setError(validateEmail(email));
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate luxury submission delay without breaking existing API contract
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setEmail('');
    }, 800);
  };

  return (
    <section
      id="newsletter"
      className="newsletter-section relative py-28 md:py-36 overflow-hidden bg-luxury-charcoal"
      aria-label="Inscription newsletter Hafrose"
    >
      {/* Gold gradient top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(196,168,130,0.5) 50%, transparent)',
        }}
        aria-hidden="true"
      />

      {/* Radial ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(196,168,130,0.07) 0%, transparent 75%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.12, 0.1)}
          className="space-y-8"
        >
          {/* Overline Badge */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
            <span className="h-[1px] bg-luxury-gold/30 w-8 block" aria-hidden="true" />
            <span className="text-overline text-luxury-gold">Privilège Exclusif</span>
            <span className="h-[1px] bg-luxury-gold/30 w-8 block" aria-hidden="true" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            className="text-fluid-h2 text-white font-serif font-extralight tracking-tight"
          >
            Recevez nos<br />
            <em className="text-luxury-gold font-light italic">invitations privées</em>
          </motion.h2>

          {/* Gold Divider */}
          <motion.div
            variants={revealLine}
            className="h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent w-16 mx-auto"
            aria-hidden="true"
          />

          {/* Body Description */}
          <motion.p
            variants={fadeUp}
            className="text-luxury-cream/70 font-sans font-light leading-relaxed text-sm md:text-base max-w-lg mx-auto"
          >
            Inscrivez-vous pour être parmi les premiers informés de nos nouvelles collections,
            ventes privées et événements exclusifs réservés aux membres de la Maison Hafrose.
          </motion.p>

          {/* Interactive Form & States */}
          <motion.div variants={fadeUp}>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center gap-3.5 py-4 px-8 border border-luxury-gold/40 bg-luxury-gold/10 backdrop-blur-md shadow-xl"
                  role="status"
                  aria-live="polite"
                >
                  <span className="w-6 h-6 rounded-full bg-luxury-gold/25 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-luxury-gold" size={13} />
                  </span>
                  <span className="text-luxury-cream text-xs md:text-sm font-sans font-light tracking-wide">
                    Merci. Vous êtes désormais inscrit aux invitations privées de la Maison.
                  </span>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }}>
                  <Form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
                    aria-label="Formulaire d'inscription newsletter"
                  >
                    <Form.Field name="newsletter-email" className="flex-grow space-y-1">
                      <Form.Label className="sr-only">Votre adresse email</Form.Label>
                      <EmailField
                        name="email"
                        value={email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Votre adresse email"
                        required
                        variant="client"
                        size="md"
                        autoComplete="email"
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? 'newsletter-email-error' : undefined}
                        className={`bg-luxury-cream/10 border-luxury-cream/20 text-luxury-cream placeholder:text-luxury-cream/35 focus:border-luxury-gold transition-colors duration-300 ${
                          error ? 'border-error-text/80 text-error-text' : ''
                        }`}
                      />
                    </Form.Field>

                    <Button
                      type="submit"
                      variant="luxury"
                      size="md"
                      loading={isSubmitting}
                      icon={!isSubmitting && <FiArrowRight size={12} />}
                      iconPosition="right"
                      className="btn-ripple whitespace-nowrap flex-shrink-0 sm:w-auto w-full min-w-[9.5rem] tracking-[0.25em]"
                    >
                      S'inscrire
                    </Button>
                  </Form>

                  {/* Inline Error Feedback */}
                  {error && (
                    <motion.div
                      id="newsletter-email-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-rose-300 font-sans font-light"
                      role="alert"
                    >
                      <FiAlertCircle size={12} className="shrink-0 text-rose-400" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Privacy note */}
                  <p className="mt-5 text-[9px] tracking-[0.25em] uppercase text-luxury-cream/35 font-sans">
                    Confidentialité garantie. Désabonnement en un clic.
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
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(196,168,130,0.5) 50%, transparent)',
        }}
        aria-hidden="true"
      />
    </section>
  );
});

export default Newsletter;
