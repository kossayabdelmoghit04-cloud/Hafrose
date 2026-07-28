import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import customerAuthService from '../../services/customerAuthService';
import Breadcrumb from '../../components/ui/Breadcrumb';
import useSEO from '../../hooks/useSEO';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  useSEO({
    title: 'Nouveau Mot de Passe',
    description: 'Définissez votre nouveau mot de passe client Maison Hafrose.',
    canonical: 'https://hafrose.com/reset-password',
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await customerAuthService.resetPassword({ token, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'La réinitialisation a échoué. Le lien est peut-être expiré.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Nouveau mot de passe', path: '/reset-password' }]} />

      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-10 space-y-3">
          <span className="text-[10px] tracking-[0.4em] uppercase text-rose-gold font-sans font-semibold">
            Sécurité
          </span>
          <h1 className="font-serif text-3xl text-luxury-charcoal font-light">
            Nouveau Mot de Passe
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light">
            Définissez votre nouveau mot de passe d'accès.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-off-white border border-beige p-8 shadow-sm"
        >
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <FiCheck size={20} />
              </div>
              <p className="font-sans text-xs text-luxury-charcoal font-medium">
                Mot de passe réinitialisé avec succès.
              </p>
              <p className="font-sans text-[11px] text-warm-gray">
                Redirection automatique vers la page de connexion…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
                  Nouveau mot de passe <span className="text-rose-gold">*</span>
                </label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-beige bg-white pl-11 pr-11 py-3.5 font-sans text-sm text-luxury-charcoal focus:outline-none focus:border-rose-gold transition-colors"
                    placeholder="8 caractères min."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray p-1"
                  >
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
                  Confirmer le mot de passe <span className="text-rose-gold">*</span>
                </label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full border border-beige bg-white pl-11 pr-11 py-3.5 font-sans text-sm text-luxury-charcoal focus:outline-none focus:border-rose-gold transition-colors"
                    placeholder="Répétez votre mot de passe"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest py-4 hover:bg-rose-gold disabled:opacity-50 transition-colors duration-300"
              >
                {isSubmitting ? 'Mise à jour…' : 'Enregistrer le nouveau mot de passe'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
