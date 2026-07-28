import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/ui/Breadcrumb';
import useSEO from '../../hooks/useSEO';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerLogin } = useAuth();
  const emailRef = useRef(null);

  const from = location.state?.from?.pathname || '/account/dashboard';

  useSEO({
    title: 'Connexion Espace Client',
    description: 'Accédez à votre espace privé Maison Hafrose pour suivre vos commandes et gérer vos préférences.',
    canonical: 'https://hafrose.com/login',
  });

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-focus email input on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

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
    if (!form.email.trim()) {
      errs.email = 'Veuillez saisir votre adresse email.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Adresse email invalide.';
    }

    if (!form.password) {
      errs.password = 'Veuillez saisir votre mot de passe.';
    } else if (form.password.length < 6) {
      errs.password = 'Le mot de passe doit contenir au moins 6 caractères.';
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
      const res = await customerLogin({
        email: form.email.trim(),
        password: form.password,
        remember: form.remember,
      });

      if (res?.success) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Bienvenue dans votre espace Maison Hafrose',
          showConfirmButton: false,
          timer: 2000,
          background: '#FDFBF7',
          color: '#111111',
          iconColor: '#D4AF37',
        });
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrors({ general: err.message || 'Identifiants incorrects. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Connexion', path: '/login' }]} />

      <div className="max-w-md mx-auto mt-8">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <span className="text-[10px] tracking-[0.4em] uppercase text-rose-gold font-sans font-semibold">
            Maison Hafrose
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-luxury-charcoal font-light">
            Espace Client
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light leading-relaxed">
            Connectez-vous pour accéder à vos commandes et avantages réservés.
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans rounded-none">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
                Adresse Email <span className="text-rose-gold">*</span>
              </label>
              <div className="relative">
                <FiMail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" aria-hidden="true" />
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full border bg-white pl-11 pr-4 py-3.5 font-sans text-sm text-luxury-charcoal focus:outline-none transition-colors ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 'border-beige focus:border-rose-gold'
                  }`}
                  placeholder="votre.email@exemple.com"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-red-500 text-[10px] font-sans mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal font-medium">
                  Mot de passe <span className="text-rose-gold">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-sans text-[10px] text-warm-gray hover:text-rose-gold transition-colors tracking-wider uppercase"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <FiLock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full border bg-white pl-11 pr-11 py-3.5 font-sans text-sm text-luxury-charcoal focus:outline-none transition-colors ${
                    errors.password ? 'border-red-400 focus:border-red-500' : 'border-beige focus:border-rose-gold'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-luxury-charcoal p-1"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-500 text-[10px] font-sans mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <span className="w-4 h-4 border border-beige bg-white peer-checked:bg-luxury-charcoal peer-checked:border-luxury-charcoal flex items-center justify-center transition-colors">
                  <FiCheck size={10} className="text-white opacity-0 peer-checked:opacity-100" />
                </span>
                <span className="font-sans text-xs text-warm-gray group-hover:text-luxury-charcoal transition-colors">
                  Se souvenir de moi
                </span>
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest py-4 hover:bg-rose-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <FiArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 border-t border-beige pt-6 text-center">
            <p className="font-sans text-xs text-warm-gray">
              Nouveau chez Hafrose ?{' '}
              <Link to="/register" className="text-luxury-charcoal font-medium hover:text-rose-gold transition-colors underline underline-offset-4">
                Créer un compte
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
