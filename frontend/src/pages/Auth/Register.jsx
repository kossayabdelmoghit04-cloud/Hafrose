import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Form from '../../components/ui/form/Form';
import PasswordField from '../../components/ui/form/PasswordField';
import ErrorBanner from '../../components/ui/ErrorBanner';
import useSEO from '../../hooks/useSEO';

/* Password Strength Evaluator */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'bg-beige' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1: return { score: 25, label: 'Faible', color: 'bg-red-400' };
    case 2: return { score: 50, label: 'Moyen', color: 'bg-amber-400' };
    case 3: return { score: 75, label: 'Fort', color: 'bg-emerald-500' };
    case 4: return { score: 100, label: 'Excellent', color: 'bg-rose-gold' };
    default: return { score: 10, label: 'Très faible', color: 'bg-red-300' };
  }
}

export default function Register() {
  const navigate = useNavigate();
  const { customerRegister } = useAuth();

  useSEO({
    title: 'Créer un Compte Privé',
    description: 'Rejoignez la communauté privée Maison Hafrose pour bénéficier de privilèges exclusifs et suivre vos commandes.',
    canonical: 'https://hafrose.com/register',
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: true,
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom complet est obligatoire.';
    if (!form.email.trim()) {
      errs.email = 'L\'adresse email est obligatoire.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Adresse email invalide.';
    }

    if (!form.password) {
      errs.password = 'Le mot de passe est obligatoire.';
    } else if (form.password.length < 8) {
      errs.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    if (!form.terms) {
      errs.terms = 'Vous devez accepter les conditions générales.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await customerRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        newsletter: form.newsletter,
      });

      if (res?.success) {
        Swal.fire({
          title: 'Bienvenue chez Maison Hafrose',
          text: 'Votre compte privilège a été créé avec succès.',
          icon: 'success',
          confirmButtonColor: '#111111',
        }).then(() => {
          navigate('/account/dashboard', { replace: true });
        });
      }
    } catch (err) {
      setErrors({ general: err.message || 'Création de compte impossible. Cet email est peut-être déjà utilisé.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Créer un compte', path: '/register' }]} />

      <div className="max-w-md mx-auto mt-8">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <span className="text-[10px] tracking-[0.4em] uppercase text-rose-gold font-sans font-semibold">
            Maison Hafrose
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-luxury-charcoal font-light">
            Créer votre Compte
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light leading-relaxed">
            Rejoignez notre cercle privé pour suivre vos pièces et profiter d'un service d'exception.
          </p>
        </div>

        {/* Card Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-off-white border border-beige p-8 shadow-sm"
        >
          {errors.general && (
            <ErrorBanner
              message={errors.general}
              onClose={() => setErrors((prev) => ({ ...prev, general: null }))}
            />
          )}

          <Form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom complet */}
            <Form.Field name="name" error={errors.name}>
              <Form.Label required>Nom complet</Form.Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder="M. ou Mme Prénom Nom"
                error={Boolean(errors.name)}
              />
              <Form.Error />
            </Form.Field>

            {/* Email */}
            <Form.Field name="email" error={errors.email}>
              <Form.Label required>Adresse Email</Form.Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="votre.email@exemple.com"
                error={Boolean(errors.email)}
              />
              <Form.Error />
            </Form.Field>

            {/* Mot de passe */}
            <Form.Field name="password" error={errors.password}>
              <Form.Label required>Mot de passe</Form.Label>
              <PasswordField
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="8 caractères min."
                error={Boolean(errors.password)}
              />

              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-sans">
                    <span className="text-warm-gray">Force du mot de passe :</span>
                    <span className="font-semibold text-luxury-charcoal">{strength.label}</span>
                  </div>
                  <div className="h-1 bg-beige rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.score}%` }} />
                  </div>
                </div>
              )}
              <Form.Error />
            </Form.Field>

            {/* Confirmation mot de passe */}
            <Form.Field name="confirmPassword" error={errors.confirmPassword}>
              <Form.Label required>Confirmer le mot de passe</Form.Label>
              <PasswordField
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Répétez votre mot de passe"
                error={Boolean(errors.confirmPassword)}
              />
              <Form.Error />
            </Form.Field>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={form.newsletter}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <span className="w-4 h-4 mt-0.5 border border-beige bg-white peer-checked:bg-luxury-charcoal peer-checked:border-luxury-charcoal flex items-center justify-center transition-colors flex-shrink-0">
                  <FiCheck size={10} className="text-white opacity-0 peer-checked:opacity-100" />
                </span>
                <span className="font-sans text-xs text-warm-gray leading-relaxed">
                  Recevoir la Gazette de la Maison Hafrose (invitations privées, avant-premières).
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <span className="w-4 h-4 mt-0.5 border border-beige bg-white peer-checked:bg-luxury-charcoal peer-checked:border-luxury-charcoal flex items-center justify-center transition-colors flex-shrink-0">
                  <FiCheck size={10} className="text-white opacity-0 peer-checked:opacity-100" />
                </span>
                <span className="font-sans text-xs text-warm-gray leading-relaxed">
                  J'accepte les <a href="#" className="underline text-luxury-charcoal">conditions générales</a> et la politique de confidentialité. <span className="text-rose-gold">*</span>
                </span>
              </label>
              {errors.terms && <p className="text-red-500 text-[10px] font-sans">{errors.terms}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
              className="py-4 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group mt-4"
            >
              {isSubmitting ? (
                'Création en cours…'
              ) : (
                <>
                  Créer mon compte
                  <FiArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </Form>

          {/* Switch to Login */}
          <div className="mt-8 border-t border-beige pt-6 text-center">
            <p className="font-sans text-xs text-warm-gray">
              Déjà membre ?{' '}
              <Link to="/login" className="text-luxury-charcoal font-medium hover:text-rose-gold transition-colors underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
