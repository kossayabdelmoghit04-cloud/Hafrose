import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import AvatarUploader from '../../components/account/AvatarUploader';
import useSEO from '../../hooks/useSEO';

export default function Profile() {
  const { customerUser, updateCustomerProfile } = useAuth();

  useSEO({
    title: 'Profil & Sécurité — Espace Client',
    description: 'Modifiez vos informations personnelles et votre mot de passe.',
  });

  const [form, setForm] = useState({
    name: customerUser?.name || '',
    email: customerUser?.email || '',
    phone: customerUser?.phone || '+33 6 12 34 56 78',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setTimeout(() => {
      updateCustomerProfile(form);
      setIsUpdatingProfile(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Profil mis à jour avec succès',
        showConfirmButton: false,
        timer: 2000,
        background: '#FDFBF7',
        color: '#111111',
        iconColor: '#D4AF37',
      });
    }, 600);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Les mots de passe ne correspondent pas.', confirmButtonColor: '#111111' });
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire({
        icon: 'success',
        title: 'Mot de passe mis à jour',
        text: 'Votre mot de passe a été modifié avec succès.',
        confirmButtonColor: '#111111',
      });
    }, 600);
  };

  return (
    <div className="space-y-10 text-left">
      <div className="border-b border-beige pb-6">
        <h1 className="font-serif text-3xl font-light text-luxury-charcoal">
          Profil & Sécurité
        </h1>
        <p className="font-sans text-xs text-warm-gray font-light mt-1">
          Gérez vos données personnelles et vos préférences de sécurité.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="bg-white border border-beige p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <AvatarUploader
            currentAvatar={customerUser?.avatar}
            onAvatarChange={(newAvatar) => updateCustomerProfile({ avatar: newAvatar })}
          />
          <div>
            <h3 className="font-serif text-lg text-luxury-charcoal font-light">
              {customerUser?.name || 'Membre Privilège'}
            </h3>
            <p className="font-sans text-xs text-warm-gray">{customerUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Personal Info Form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleProfileSubmit}
        className="bg-white border border-beige p-8 space-y-6 shadow-sm"
      >
        <div className="flex items-center gap-2 border-b border-beige pb-4 text-rose-gold">
          <FiUser size={18} />
          <h3 className="font-serif text-lg font-light text-luxury-charcoal">
            Informations Personnelles
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
              Nom complet
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
            />
          </div>

          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
              Adresse Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
            />
          </div>

          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
              Téléphone mobile
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
            />
          </div>
        </div>

        <div className="pt-4 text-right">
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-6 py-3.5 hover:bg-rose-gold disabled:opacity-50 transition-colors"
          >
            {isUpdatingProfile ? 'Enregistrement…' : 'Enregistrer le profil'}
          </button>
        </div>
      </motion.form>

      {/* Change Password Form */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white border border-beige p-8 space-y-6 shadow-sm"
      >
        <div className="flex items-center gap-2 border-b border-beige pb-4 text-rose-gold">
          <FiLock size={18} />
          <h3 className="font-serif text-lg font-light text-luxury-charcoal">
            Modifier le Mot de Passe
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
              className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
            />
          </div>

          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
            />
          </div>

          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2 font-medium">
              Confirmer le nouveau
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
              className="w-full border border-beige bg-white px-4 py-3 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
            />
          </div>
        </div>

        <div className="pt-4 text-right">
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-6 py-3.5 hover:bg-rose-gold disabled:opacity-50 transition-colors"
          >
            {isUpdatingPassword ? 'Modification…' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  );
}
