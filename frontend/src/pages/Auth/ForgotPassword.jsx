import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import customerAuthService from '../../services/customerAuthService';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Form from '../../components/ui/form/Form';
import ErrorBanner from '../../components/ui/ErrorBanner';
import SuccessState from '../../components/ui/SuccessState';
import useSEO from '../../hooks/useSEO';

export default function ForgotPassword() {
  useSEO({
    title: 'Mot de Passe Oublié',
    description: 'Réinitialisez l\'accès à votre compte client Maison Hafrose.',
    canonical: 'https://hafrose.com/forgot-password',
  });

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await customerAuthService.requestPasswordReset(email.trim());
      setSuccessMessage(res.message || 'Un lien de réinitialisation vous a été envoyé par email.');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Mot de passe oublié', path: '/forgot-password' }]} />

      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-10 space-y-3">
          <span className="text-[10px] tracking-[0.4em] uppercase text-rose-gold font-sans font-semibold">
            Récupération
          </span>
          <h1 className="font-serif text-3xl text-luxury-charcoal font-light">
            Mot de passe oublié
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light leading-relaxed">
            Saisissez votre email et nous vous enverrons les instructions de réinitialisation.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-off-white border border-beige p-8 shadow-sm"
        >
          {successMessage ? (
            <SuccessState
              title="Email envoyé"
              description={successMessage}
              action={
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-rose-gold hover:text-luxury-charcoal transition-colors pt-2"
                >
                  Retour à la connexion
                  <FiArrowRight size={12} />
                </Link>
              }
            />
          ) : (
            <Form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <ErrorBanner
                  message={error}
                  onClose={() => setError('')}
                />
              )}

              <Form.Field name="email" error={error}>
                <Form.Label required>Adresse Email</Form.Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="votre.email@exemple.com"
                  error={Boolean(error)}
                />
                <Form.Error />
              </Form.Field>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                className="py-4 text-[10px] uppercase tracking-widest"
              >
                {isSubmitting ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="font-sans text-xs text-warm-gray hover:text-luxury-charcoal transition-colors">
                  ← Retour à la connexion
                </Link>
              </div>
            </Form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
