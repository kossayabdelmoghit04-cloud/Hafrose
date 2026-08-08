import React, { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, AlertCircle, LogIn } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useLogin } from '../../hooks/useAuthHooks';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState('');

  const loginMutation = useLogin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!email.trim() || !email.includes('@')) {
      setValidationError('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (!password) {
      setValidationError('Veuillez saisir votre mot de passe.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      const redirectTo = searchParams.get('redirect') || '/account';
      navigate(redirectTo);
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-h2 text-neutral-950">Connexion Client</h1>
        <p className="text-body-sm text-neutral-600">
          Accédez à votre espace privé et suivez vos commandes.
        </p>
      </div>

      {(validationError || loginMutation.isError) && (
        <Alert
          variant="error"
          title="Erreur de connexion"
          icon={<AlertCircle className="w-5 h-5 text-error-600" />}
        >
          {validationError ||
            (loginMutation.error as { message?: string })?.message ||
            'Identifiants incorrects. Veuillez réessayer.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Adresse E-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nom@exemple.com"
          leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
        />

        <PasswordInput
          label="Mot de Passe"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4 text-neutral-400" />}
        />

        <div className="flex items-center justify-between text-body-sm">
          <Checkbox
            label="Se souvenir de moi"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Link
            to="/forgot-password"
            className="text-burgundy-600 hover:text-burgundy-800 font-medium hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loginMutation.isPending}
          leftIcon={<LogIn className="w-5 h-5" />}
        >
          Se Connecter
        </Button>
      </form>

      <div className="pt-4 border-t border-neutral-200 text-center text-body-sm text-neutral-600">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-burgundy-600 font-semibold hover:underline">
          Créer un compte HAFROSE
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
