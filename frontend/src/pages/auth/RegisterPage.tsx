import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useRegister } from '../../hooks/useAuthHooks';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validationError, setValidationError] = useState('');

  const registerMutation = useRegister();
  const navigate = useNavigate();

  // Password strength calculation helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-neutral-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Faible', color: 'bg-error-500' };
      case 2:
        return { score: 50, label: 'Moyen', color: 'bg-warning-500' };
      case 3:
        return { score: 75, label: 'Fort', color: 'bg-info-500' };
      case 4:
        return { score: 100, label: 'Excellent', color: 'bg-success-600' };
      default:
        return { score: 10, label: 'Très faible', color: 'bg-error-300' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('Veuillez renseigner votre prénom et votre nom.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    if (password.length < 8) {
      setValidationError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== passwordConfirmation) {
      setValidationError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!acceptTerms) {
      setValidationError('Veuillez accepter les Conditions Générales de Vente.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate('/account');
    } catch {
      // Handled by mutation error state
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-h2 text-neutral-950">Créer un Compte</h1>
        <p className="text-body-sm text-neutral-600">
          Rejoignez le Cercle Privé HAFROSE et bénéficiez d'avantages exclusifs.
        </p>
      </div>

      {(validationError || registerMutation.isError) && (
        <Alert
          variant="error"
          title="Erreur d'inscription"
          icon={<AlertCircle className="w-5 h-5 text-error-600" />}
        >
          {validationError ||
            (registerMutation.error as { message?: string })?.message ||
            'Une erreur est survenue lors de la création du compte.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Prénom"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Éléonore"
            leftIcon={<User className="w-4 h-4 text-neutral-400" />}
          />
          <Input
            label="Nom"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="De Saint-Germain"
          />
        </div>

        <Input
          label="Adresse E-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="eleonore@exemple.com"
          leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
        />

        <Input
          label="Téléphone (Optionnel)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+33 6 12 34 56 78"
          leftIcon={<Phone className="w-4 h-4 text-neutral-400" />}
        />

        <div className="space-y-2">
          <PasswordInput
            label="Mot de Passe"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4 text-neutral-400" />}
          />
          {password && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-caption font-medium">
                <span className="text-neutral-500">Force du mot de passe :</span>
                <span className="text-neutral-900">{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <PasswordInput
          label="Confirmer le Mot de Passe"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4 text-neutral-400" />}
        />

        <Checkbox
          label={
            <span>
              J'accepte les{' '}
              <a href="#" className="text-burgundy-600 underline font-medium">
                Conditions Générales de Vente
              </a>{' '}
              et la Politique de Confidentialité.
            </span>
          }
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={registerMutation.isPending}
          leftIcon={<UserPlus className="w-5 h-5" />}
        >
          Créer mon Compte
        </Button>
      </form>

      <div className="pt-4 border-t border-neutral-200 text-center text-body-sm text-neutral-600">
        Déjà membre HAFROSE ?{' '}
        <Link to="/login" className="text-burgundy-600 font-semibold hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
