import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAdminLogin } from '../../features/admin/hooks/useAdminAuth';
import { ROUTES } from '../../constants/routes.constants';
import { useSEO } from '../../hooks/useSEO';

/**
 * AdminLoginPage — Page de connexion réservée aux administrateurs HAFROSE.
 * Pointe exclusivement sur POST /api/admin/login (route protégée backend).
 * URL: /admin/login
 */
export const AdminLoginPage: React.FC = () => {
  useSEO({ title: 'Administration HAFROSE | Connexion', noIndex: true });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const adminLoginMutation = useAdminLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setValidationError('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setValidationError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      await adminLoginMutation.mutateAsync({ email: cleanEmail, password: cleanPassword });
      navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
    } catch {
      // Error handled by mutation state
    }
  };

  /**
   * Extracts a user-friendly error message from the mutation error.
   * Accurately distinguishes Network errors, HTTP 401, 403, 422 (validation), and 500.
   */
  const getErrorMessage = (): string => {
    if (validationError) return validationError;
    if (!adminLoginMutation.isError) return '';

    const rawErr = adminLoginMutation.error as unknown;

    if (typeof rawErr === 'string') {
      const lower = rawErr.toLowerCase();
      if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('econnrefused')) {
        return 'Impossible de contacter le serveur. Veuillez vérifier que le serveur backend est démarré.';
      }
      return rawErr;
    }

    const err = rawErr as {
      status?: number;
      status_code?: number;
      message?: string;
      errors?: Record<string, string[]>;
      response?: {
        status?: number;
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
    } | null;

    // Extract validation errors object if present (e.g. HTTP 422)
    const errorsObj = err?.errors || err?.response?.data?.errors;
    if (errorsObj && typeof errorsObj === 'object' && Object.keys(errorsObj).length > 0) {
      return Object.values(errorsObj).flat().join(' ');
    }

    const status = err?.status || err?.status_code || err?.response?.status;
    if (status === 403) {
      return 'Accès refusé. Ce compte ne dispose pas des privilèges administrateur.';
    }
    if (status === 500) {
      return 'Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.';
    }

    const msg = err?.message || err?.response?.data?.message;
    if (msg) {
      const lower = msg.toLowerCase();
      if (lower.includes('network') || lower.includes('connexion') || lower.includes('econnrefused')) {
        return 'Impossible de contacter le serveur. Veuillez vérifier que le serveur backend est démarré.';
      }
      if (lower.includes('unauthenticated')) {
        return 'Identifiants incorrects. Veuillez vérifier votre adresse email et votre mot de passe.';
      }
      if (msg !== 'Validation failed') {
        return msg;
      }
    }

    return 'Identifiants incorrects. Veuillez vérifier votre adresse email et votre mot de passe.';
  };


  const errorMsg = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-burgundy-700 text-white mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl text-white tracking-wide">Administration HAFROSE</h1>
          <p className="text-neutral-400 text-sm">Accès réservé aux administrateurs</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {errorMsg && (
            <Alert
              variant="error"
              title="Accès refusé"
              icon={<AlertCircle className="w-5 h-5 text-error-600" />}
            >
              {errorMsg}
            </Alert>
          )}

          <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="admin-email"
              label="Adresse E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hafrose.com"
              leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
              autoComplete="username"
            />

            <PasswordInput
              id="admin-password"
              label="Mot de Passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-neutral-400" />}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={adminLoginMutation.isPending}
              leftIcon={<ShieldCheck className="w-5 h-5" />}
            >
              Accéder au Panneau Admin
            </Button>
          </form>
        </div>

        <p className="text-center text-neutral-600 text-xs mt-6">
          © {new Date().getFullYear()} HAFROSE — Maison de Luxe. Accès sécurisé.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
