import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import customerAuthService from '../../services/customerAuthService';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Form from '../../components/ui/form/Form';
import PasswordField from '../../components/ui/form/PasswordField';
import ErrorBanner from '../../components/ui/ErrorBanner';
import SuccessState from '../../components/ui/SuccessState';
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
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-off-white border border-beige p-8 shadow-sm"
        >
          {success ? (
            <SuccessState
              title="Mot de passe réinitialisé"
              description="Votre mot de passe a bien été mis à jour. Redirection automatique vers la page de connexion…"
            />
          ) : (
            <Form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <ErrorBanner
                  message={error}
                  onClose={() => setError('')}
                />
              )}

              <Form.Field name="password" error={error && password.length < 8 ? error : undefined}>
                <Form.Label required>Nouveau mot de passe</Form.Label>
                <PasswordField
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="8 caractères min."
                />
                <Form.Error />
              </Form.Field>

              <Form.Field name="confirmPassword" error={error && password !== confirmPassword ? error : undefined}>
                <Form.Label required>Confirmer le mot de passe</Form.Label>
                <PasswordField
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Répétez votre mot de passe"
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
                {isSubmitting ? 'Mise à jour…' : 'Enregistrer le nouveau mot de passe'}
              </Button>
            </Form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
