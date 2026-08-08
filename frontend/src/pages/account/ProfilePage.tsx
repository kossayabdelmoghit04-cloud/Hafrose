import React, { useState, useEffect, FormEvent } from 'react';
import { User, Mail, Phone, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuthStore } from '../../stores/useAuthStore';
import { useProfile, useUpdateProfile, useChangePassword } from '../../hooks/useAuthHooks';
import { getApiErrorMessage } from '../../hooks/useErrorHandler';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: profileData } = useProfile();

  const currentUser = profileData || user;

  const [firstName, setFirstName] = useState(currentUser?.first_name || 'Éléonore');
  const [lastName, setLastName] = useState(currentUser?.last_name || 'De Saint-Germain');
  const [email, setEmail] = useState(currentUser?.email || 'eleonore@hafrose.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+33 6 12 34 56 78');

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.first_name || '');
      setLastName(currentUser.last_name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setProfileError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      });
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(getApiErrorMessage(err));
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="font-serif text-h2 text-neutral-950">Mon Profil & Sécurité</h1>
        <p className="text-body-sm text-neutral-600">
          Mettez à jour vos informations personnelles et gérez vos préférences de compte.
        </p>
      </div>

      {/* Profile Form */}
      <Card className="p-6 md:p-8 bg-white space-y-6">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="font-serif text-h3 text-neutral-950 flex items-center gap-2">
            <User className="w-5 h-5 text-burgundy-500" /> Informations Personnelles
          </h2>
        </div>

        {profileSuccess && (
          <Alert
            variant="success"
            title="Profil mis à jour"
            icon={<CheckCircle2 className="w-5 h-5 text-success-600" />}
          >
            Vos informations personnelles ont été enregistrées avec succès.
          </Alert>
        )}
        {profileError && (
          <Alert variant="error" title="Erreur" icon={<AlertCircle className="w-5 h-5 text-error-600" />}>
            {profileError}
          </Alert>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Nom"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Adresse E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
            />
            <Input
              label="Numéro de Téléphone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-neutral-400" />}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={updateProfileMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Sauvegarder les Modifications
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Form */}
      <Card className="p-6 md:p-8 bg-white space-y-6">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="font-serif text-h3 text-neutral-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-burgundy-500" /> Sécurité & Mot de Passe
          </h2>
        </div>

        {passwordSuccess && (
          <Alert
            variant="success"
            title="Mot de passe modifié"
            icon={<CheckCircle2 className="w-5 h-5 text-success-600" />}
          >
            Votre mot de passe a été mis à jour avec succès.
          </Alert>
        )}
        {passwordError && (
          <Alert variant="error" title="Erreur" icon={<AlertCircle className="w-5 h-5 text-error-600" />}>
            {passwordError}
          </Alert>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <PasswordInput
            label="Mot de Passe Actuel"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              label="Nouveau Mot de Passe"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <PasswordInput
              label="Confirmer le Nouveau Mot de Passe"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              variant="outline"
              size="md"
              isLoading={changePasswordMutation.isPending}
            >
              Changer le Mot de Passe
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
