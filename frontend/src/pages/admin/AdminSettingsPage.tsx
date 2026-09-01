import React, { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

import { useAdminSettings, useUpdateSettings, useClearCache } from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';
import { AdminSettings } from '../../types/admin.types';
import {
  GeneralSettingsSection,
  HeroSettingsSection,
  EditorialSettingsSection,
  PromoSettingsSection,
} from '../../components/admin/settings';

const TABS = [
  { id: 'general', label: 'Général' },
  { id: 'hero', label: 'Section Hero' },
  { id: 'editorial', label: 'Collection Éditoriale' },
  { id: 'promo', label: 'Bannière Promo' },
] as const;

type TabId = typeof TABS[number]['id'];

export const AdminSettingsPage: React.FC = () => {
  useSEO({ title: 'Paramètres du Site | HAFROSE Admin', noIndex: true });

  const { data: settingsData, isLoading, isError, refetch } = useAdminSettings();
  const updateSettingsMutation = useUpdateSettings();
  const clearCacheMutation = useClearCache();

  // ── Champs généraux
  const [siteName, setSiteName] = useState('HAFROSE');
  const [contactEmail, setContactEmail] = useState('contact@hafrose.com');
  const [phone, setPhone] = useState('+212 600 000 000');
  const [currency, setCurrency] = useState('MAD');
  const [shippingFee, setShippingFee] = useState('50');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1000');

  // ── Champs Hero
  const [heroEyebrow, setHeroEyebrow] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroPrimaryBtnText, setHeroPrimaryBtnText] = useState('');
  const [heroPrimaryBtnUrl, setHeroPrimaryBtnUrl] = useState('');
  const [heroSecondaryBtnText, setHeroSecondaryBtnText] = useState('');
  const [heroSecondaryBtnUrl, setHeroSecondaryBtnUrl] = useState('');
  const [heroCurrentImageUrl, setHeroCurrentImageUrl] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const heroFileRef = useRef<HTMLInputElement | null>(null);

  // ── Champs Éditorial
  const [editorialBadge, setEditorialBadge] = useState('');
  const [editorialTitle, setEditorialTitle] = useState('');
  const [editorialDescription, setEditorialDescription] = useState('');
  const [editorialQuote, setEditorialQuote] = useState('');
  const [editorialBtnText, setEditorialBtnText] = useState('');
  const [editorialBtnUrl, setEditorialBtnUrl] = useState('');
  const [editorialCurrentImageUrl, setEditorialCurrentImageUrl] = useState<string | null>(null);
  const [editorialPreview, setEditorialPreview] = useState<string | null>(null);
  const editorialFileRef = useRef<HTMLInputElement | null>(null);

  // ── Champs Promo
  const [promoBadge, setPromoBadge] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoSubtitle, setPromoSubtitle] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [promoBtnText, setPromoBtnText] = useState('');
  const [promoBtnUrl, setPromoBtnUrl] = useState('');
  const [promoCurrentImageUrl, setPromoCurrentImageUrl] = useState<string | null>(null);
  const [promoPreview, setPromoPreview] = useState<string | null>(null);
  const promoFileRef = useRef<HTMLInputElement | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('general');

  useEffect(() => {
    if (settingsData) {
      const s: AdminSettings = ((settingsData as unknown as { data?: AdminSettings })?.data || settingsData) as AdminSettings;
      // Généraux
      if (s.site_name) setSiteName(String(s.site_name));
      if (s.contact_email) setContactEmail(String(s.contact_email));
      if (s.phone) setPhone(String(s.phone));
      if (s.currency) setCurrency(String(s.currency));
      if (s.shipping_fee !== undefined && s.shipping_fee !== null) setShippingFee(String(s.shipping_fee));
      if (s.free_shipping_threshold !== undefined && s.free_shipping_threshold !== null) setFreeShippingThreshold(String(s.free_shipping_threshold));
      // Hero
      if (s.hero_eyebrow) setHeroEyebrow(String(s.hero_eyebrow));
      if (s.hero_title) setHeroTitle(String(s.hero_title));
      if (s.hero_description) setHeroDescription(String(s.hero_description));
      if (s.hero_primary_btn_text) setHeroPrimaryBtnText(String(s.hero_primary_btn_text));
      if (s.hero_primary_btn_url) setHeroPrimaryBtnUrl(String(s.hero_primary_btn_url));
      if (s.hero_secondary_btn_text) setHeroSecondaryBtnText(String(s.hero_secondary_btn_text));
      if (s.hero_secondary_btn_url) setHeroSecondaryBtnUrl(String(s.hero_secondary_btn_url));
      setHeroCurrentImageUrl((s.hero_image_url as string) ?? (s.hero_image as string) ?? null);
      // Éditorial
      if (s.editorial_badge) setEditorialBadge(String(s.editorial_badge));
      if (s.editorial_title) setEditorialTitle(String(s.editorial_title));
      if (s.editorial_description) setEditorialDescription(String(s.editorial_description));
      if (s.editorial_quote) setEditorialQuote(String(s.editorial_quote));
      if (s.editorial_btn_text) setEditorialBtnText(String(s.editorial_btn_text));
      if (s.editorial_btn_url) setEditorialBtnUrl(String(s.editorial_btn_url));
      setEditorialCurrentImageUrl((s.editorial_image_url as string) ?? (s.editorial_image as string) ?? null);
      // Promo
      if (s.promo_badge) setPromoBadge(String(s.promo_badge));
      if (s.promo_title) setPromoTitle(String(s.promo_title));
      if (s.promo_subtitle) setPromoSubtitle(String(s.promo_subtitle));
      if (s.promo_description) setPromoDescription(String(s.promo_description));
      if (s.promo_btn_text) setPromoBtnText(String(s.promo_btn_text));
      if (s.promo_btn_url) setPromoBtnUrl(String(s.promo_btn_url));
      setPromoCurrentImageUrl((s.promo_image_url as string) ?? (s.promo_image as string) ?? null);
    }
  }, [settingsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError('');

    try {
      const formData = new FormData();

      const textSettings: Record<string, string> = {
        site_name: siteName,
        contact_email: contactEmail,
        phone,
        currency,
        shipping_fee: shippingFee,
        free_shipping_threshold: freeShippingThreshold,
        hero_eyebrow: heroEyebrow,
        hero_title: heroTitle,
        hero_description: heroDescription,
        hero_primary_btn_text: heroPrimaryBtnText,
        hero_primary_btn_url: heroPrimaryBtnUrl,
        hero_secondary_btn_text: heroSecondaryBtnText,
        hero_secondary_btn_url: heroSecondaryBtnUrl,
        editorial_badge: editorialBadge,
        editorial_title: editorialTitle,
        editorial_description: editorialDescription,
        editorial_quote: editorialQuote,
        editorial_btn_text: editorialBtnText,
        editorial_btn_url: editorialBtnUrl,
        promo_badge: promoBadge,
        promo_title: promoTitle,
        promo_subtitle: promoSubtitle,
        promo_description: promoDescription,
        promo_btn_text: promoBtnText,
        promo_btn_url: promoBtnUrl,
      };

      Object.entries(textSettings).forEach(([key, val]) => {
        formData.append(`settings[${key}]`, val);
      });

      if (heroFileRef.current?.files?.[0]) {
        formData.append('hero_image', heroFileRef.current.files[0]);
      }
      if (editorialFileRef.current?.files?.[0]) {
        formData.append('editorial_image', editorialFileRef.current.files[0]);
      }
      if (promoFileRef.current?.files?.[0]) {
        formData.append('promo_image', promoFileRef.current.files[0]);
      }

      await updateSettingsMutation.mutateAsync(formData);
      setSaveSuccess(true);
      setHeroPreview(null);
      setEditorialPreview(null);
      setPromoPreview(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des paramètres.';
      setSaveError(errorMsg);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCacheMutation.mutateAsync();
      alert('Cache système purgé avec succès !');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la purge du cache.';
      alert(errorMsg);
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
        <p className="text-xs text-neutral-400">Paramètres généraux, contenu Home, livraisons et devise HAFROSE</p>
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

      {/* Onglets */}
      <div className="flex gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-burgundy-800 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg space-y-6">
        {activeTab === 'general' && (
          <GeneralSettingsSection
            siteName={siteName}
            onSiteNameChange={setSiteName}
            contactEmail={contactEmail}
            onContactEmailChange={setContactEmail}
            phone={phone}
            onPhoneChange={setPhone}
            currency={currency}
            onCurrencyChange={setCurrency}
            shippingFee={shippingFee}
            onShippingFeeChange={setShippingFee}
            freeShippingThreshold={freeShippingThreshold}
            onFreeShippingThresholdChange={setFreeShippingThreshold}
          />
        )}

        {activeTab === 'hero' && (
          <HeroSettingsSection
            heroEyebrow={heroEyebrow}
            onHeroEyebrowChange={setHeroEyebrow}
            heroTitle={heroTitle}
            onHeroTitleChange={setHeroTitle}
            heroDescription={heroDescription}
            onHeroDescriptionChange={setHeroDescription}
            heroPrimaryBtnText={heroPrimaryBtnText}
            onHeroPrimaryBtnTextChange={setHeroPrimaryBtnText}
            heroPrimaryBtnUrl={heroPrimaryBtnUrl}
            onHeroPrimaryBtnUrlChange={setHeroPrimaryBtnUrl}
            heroSecondaryBtnText={heroSecondaryBtnText}
            onHeroSecondaryBtnTextChange={setHeroSecondaryBtnText}
            heroSecondaryBtnUrl={heroSecondaryBtnUrl}
            onHeroSecondaryBtnUrlChange={setHeroSecondaryBtnUrl}
            heroCurrentImageUrl={heroCurrentImageUrl}
            heroPreview={heroPreview}
            onHeroPreviewChange={setHeroPreview}
            heroFileRef={heroFileRef}
          />
        )}

        {activeTab === 'editorial' && (
          <EditorialSettingsSection
            editorialBadge={editorialBadge}
            onEditorialBadgeChange={setEditorialBadge}
            editorialTitle={editorialTitle}
            onEditorialTitleChange={setEditorialTitle}
            editorialDescription={editorialDescription}
            onEditorialDescriptionChange={setEditorialDescription}
            editorialQuote={editorialQuote}
            onEditorialQuoteChange={setEditorialQuote}
            editorialBtnText={editorialBtnText}
            onEditorialBtnTextChange={setEditorialBtnText}
            editorialBtnUrl={editorialBtnUrl}
            onEditorialBtnUrlChange={setEditorialBtnUrl}
            editorialCurrentImageUrl={editorialCurrentImageUrl}
            editorialPreview={editorialPreview}
            onEditorialPreviewChange={setEditorialPreview}
            editorialFileRef={editorialFileRef}
          />
        )}

        {activeTab === 'promo' && (
          <PromoSettingsSection
            promoBadge={promoBadge}
            onPromoBadgeChange={setPromoBadge}
            promoTitle={promoTitle}
            onPromoTitleChange={setPromoTitle}
            promoSubtitle={promoSubtitle}
            onPromoSubtitleChange={setPromoSubtitle}
            promoDescription={promoDescription}
            onPromoDescriptionChange={setPromoDescription}
            promoBtnText={promoBtnText}
            onPromoBtnTextChange={setPromoBtnText}
            promoBtnUrl={promoBtnUrl}
            onPromoBtnUrlChange={setPromoBtnUrl}
            promoCurrentImageUrl={promoCurrentImageUrl}
            promoPreview={promoPreview}
            onPromoPreviewChange={setPromoPreview}
            promoFileRef={promoFileRef}
          />
        )}

        {/* Footer du formulaire */}
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
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-burgundy-800 hover:bg-burgundy-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md disabled:opacity-60"
          >
            {updateSettingsMutation.isPending ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
