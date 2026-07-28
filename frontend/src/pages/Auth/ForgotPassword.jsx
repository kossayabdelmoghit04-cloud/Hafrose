import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiCheck } from 'react-icons/fi';
import customerAuthService from '../../services/customerAuthService';
import Breadcrumb from '../../components/ui/Breadcrumb';
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
          className="bg-off-white border border-beige p-8 shadow-sm"
        >
          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <FiCheck size={20} />
              </div>
              <p className="font-sans text-xs font-light text-luxury-charcoal leading-relaxed">
                {successMessage}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-rose-gold hover:text-luxury-charcoal transition-colors pt-2"
              >
                Retour à la connexion
                <FiArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
                  Adresse Email <span className="text-rose-gold">*</span>
                </label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                    className="w-full border border-beige bg-white pl-11 pr-4 py-3.5 font-sans text-sm text-luxury-charcoal focus:outline-none focus:border-rose-gold transition-colors"
                    placeholder="votre.email@exemple.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest py-4 hover:bg-rose-gold disabled:opacity-50 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="font-sans text-xs text-warm-gray hover:text-luxury-charcoal transition-colors">
                  ← Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
