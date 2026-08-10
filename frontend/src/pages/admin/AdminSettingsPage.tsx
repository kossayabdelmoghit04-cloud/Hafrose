import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

import { useAdminSettings, useUpdateSettings, useClearCache } from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';

export const AdminSettingsPage: React.FC = () => {
  useSEO({ title: 'Paramètres du Site | HAFROSE Admin', noIndex: true });

  const { data: settingsData, isLoading, isError, refetch } = useAdminSettings();
  const updateSettingsMutation = useUpdateSettings();
  const clearCacheMutation = useClearCache();

  const [siteName, setSiteName] = useState('HAFROSE');
  const [contactEmail, setContactEmail] = useState('contact@hafrose.com');
  const [phone, setPhone] = useState('+212 600 000 000');
  const [currency, setCurrency] = useState('MAD');
  const [shippingFee, setShippingFee] = useState('50');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1000');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (settingsData) {
      const s = settingsData.data || settingsData;
      if (s.site_name) setSiteName(s.site_name);
      if (s.contact_email) setContactEmail(s.contact_email);
      if (s.phone) setPhone(s.phone);
      if (s.currency) setCurrency(s.currency);
      if (s.shipping_fee) setShippingFee(String(s.shipping_fee));
      if (s.free_shipping_threshold) setFreeShippingThreshold(String(s.free_shipping_threshold));
    }
  }, [settingsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError('');

    try {
      await updateSettingsMutation.mutateAsync({
        site_name: siteName,
        contact_email: contactEmail,
        phone,
        currency,
        shipping_fee: Number(shippingFee),
        free_shipping_threshold: Number(freeShippingThreshold),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Erreur lors de la sauvegarde des paramètres.');
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCacheMutation.mutateAsync();
      alert('Cache système purgé avec succès !');
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de la purge du cache.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="xl" variant="burgundy" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible de charger les paramètres de la boutique."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <h2 className="font-serif text-xl text-white font-medium">Configuration de la Boutique</h2>
        <p className="text-xs text-neutral-400">Paramètres généraux, livraisons et devise HAFROSE</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Paramètres sauvegardés avec succès !</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-2xl flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Nom de la Marque</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Email de Contact Support</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Téléphone Conciergerie</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Devise Principale</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="MAD">MAD (Dirham Marocain)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Frais de Livraison De Base</label>
            <input
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Seuil Livraison Gratuite</label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-900">
          <button
            type="button"
            onClick={handleClearCache}
            disabled={clearCacheMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${clearCacheMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Purger le cache du site</span>
          </button>

          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-burgundy-800 hover:bg-burgundy-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
