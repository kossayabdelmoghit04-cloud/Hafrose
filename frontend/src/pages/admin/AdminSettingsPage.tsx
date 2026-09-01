import React, { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle, XCircle, RefreshCw, Image, Upload, X } from 'lucide-react';

import { useAdminSettings, useUpdateSettings, useClearCache } from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';
import { getImageUrl } from '../../utils/formatters';
import { AdminSettings } from '../../types/admin.types';

// ── Composant réutilisable: champ image avec prévisualisation ────────────────
interface ImageFieldProps {
  label: string;
  currentUrl?: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
  previewUrl: string | null;
  onPreview: (url: string | null) => void;
  hint?: string;
}

const ImageField: React.FC<ImageFieldProps> = ({ label, currentUrl, fileRef, previewUrl, onPreview, hint }) => {
  const displayUrl = previewUrl ?? (currentUrl ? getImageUrl(currentUrl) : null);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-neutral-300">{label}</label>
      {hint && <p className="text-[10px] text-neutral-500">{hint}</p>}

      {displayUrl && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900">
          <img
            src={displayUrl}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {previewUrl && (
            <button
              type="button"
              onClick={() => { onPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="absolute top-1.5 right-1.5 bg-neutral-950/80 rounded-full p-1 hover:bg-rose-900 transition"
              title="Annuler la sélection"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      )}

      <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs text-neutral-300 hover:text-white transition-all">
        <Upload className="w-3.5 h-3.5" />
        <span>Choisir une image</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onPreview(URL.createObjectURL(file));
            }
          }}
        />
      </label>
    </div>
  );
};

// ── Page principale ──────────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'editorial' | 'promo'>('general');

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

      // Paramètres textuels — envoyés dans settings[key]
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

      // Fichiers images
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
      // Réinitialiser les previews
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

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'hero', label: 'Section Hero' },
    { id: 'editorial', label: 'Collection Éditoriale' },
    { id: 'promo', label: 'Bannière Promo' },
  ] as const;

  const inputCls = 'w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50';
  const textareaCls = inputCls + ' resize-none';

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
        {tabs.map((tab) => (
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

        {/* ── ONGLET GÉNÉRAL ── */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Nom de la Marque</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Email de Contact Support</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Téléphone Conciergerie</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Devise Principale</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                <option value="MAD">MAD (Dirham Marocain)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Frais de Livraison De Base</label>
              <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Seuil Livraison Gratuite</label>
              <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        {/* ── ONGLET HERO ── */}
        {activeTab === 'hero' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Image className="w-3.5 h-3.5" />
              <span>Section Hero — Première image visible (LCP)</span>
            </div>
            <ImageField
              label="Image de fond Hero"
              currentUrl={heroCurrentImageUrl}
              fileRef={heroFileRef}
              previewUrl={heroPreview}
              onPreview={setHeroPreview}
              hint="Format: JPEG, PNG, WEBP · Max: 10 Mo · Recommandé: 1920×1080px"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Texte Eyebrow (label au-dessus)</label>
                <input type="text" value={heroEyebrow} onChange={(e) => setHeroEyebrow(e.target.value)} className={inputCls} placeholder="ex: Collection Printemps — Été 2025" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Titre Principal (h1)</label>
                <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className={inputCls} placeholder="ex: L'Art de la Féminité" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <textarea rows={3} value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} className={textareaCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton Principal — Texte</label>
                <input type="text" value={heroPrimaryBtnText} onChange={(e) => setHeroPrimaryBtnText(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton Principal — URL</label>
                <input type="text" value={heroPrimaryBtnUrl} onChange={(e) => setHeroPrimaryBtnUrl(e.target.value)} className={inputCls} placeholder="/shop" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton Secondaire — Texte</label>
                <input type="text" value={heroSecondaryBtnText} onChange={(e) => setHeroSecondaryBtnText(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton Secondaire — URL</label>
                <input type="text" value={heroSecondaryBtnUrl} onChange={(e) => setHeroSecondaryBtnUrl(e.target.value)} className={inputCls} placeholder="/shop" />
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET ÉDITORIAL ── */}
        {activeTab === 'editorial' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Image className="w-3.5 h-3.5" />
              <span>Collection Éditoriale — Section Symphonie Rose</span>
            </div>
            <ImageField
              label="Image Éditoriale"
              currentUrl={editorialCurrentImageUrl}
              fileRef={editorialFileRef}
              previewUrl={editorialPreview}
              onPreview={setEditorialPreview}
              hint="Format: JPEG, PNG, WEBP · Max: 10 Mo · Recommandé: 800×600px (4:3)"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Badge</label>
                <input type="text" value={editorialBadge} onChange={(e) => setEditorialBadge(e.target.value)} className={inputCls} placeholder="ex: Édition Limitée" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Titre</label>
                <input type="text" value={editorialTitle} onChange={(e) => setEditorialTitle(e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <textarea rows={3} value={editorialDescription} onChange={(e) => setEditorialDescription(e.target.value)} className={textareaCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Citation (italique)</label>
                <textarea rows={2} value={editorialQuote} onChange={(e) => setEditorialQuote(e.target.value)} className={textareaCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton — Texte</label>
                <input type="text" value={editorialBtnText} onChange={(e) => setEditorialBtnText(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton — URL</label>
                <input type="text" value={editorialBtnUrl} onChange={(e) => setEditorialBtnUrl(e.target.value)} className={inputCls} placeholder="/shop" />
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET PROMO ── */}
        {activeTab === 'promo' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Image className="w-3.5 h-3.5" />
              <span>Bannière Promotionnelle — Ventes Privées</span>
            </div>
            <ImageField
              label="Image Bannière Promo"
              currentUrl={promoCurrentImageUrl}
              fileRef={promoFileRef}
              previewUrl={promoPreview}
              onPreview={setPromoPreview}
              hint="Format: JPEG, PNG, WEBP · Max: 10 Mo · Recommandé: 1200×500px"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Badge</label>
                <input type="text" value={promoBadge} onChange={(e) => setPromoBadge(e.target.value)} className={inputCls} placeholder="ex: Jusqu'au 20 Août" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Titre</label>
                <input type="text" value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Sous-titre</label>
                <input type="text" value={promoSubtitle} onChange={(e) => setPromoSubtitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton — Texte</label>
                <input type="text" value={promoBtnText} onChange={(e) => setPromoBtnText(e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <textarea rows={3} value={promoDescription} onChange={(e) => setPromoDescription(e.target.value)} className={textareaCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton — URL</label>
                <input type="text" value={promoBtnUrl} onChange={(e) => setPromoBtnUrl(e.target.value)} className={inputCls} placeholder="/shop" />
              </div>
            </div>
          </div>
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
            {updateSettingsMutation.isPending
              ? <Spinner size="sm" />
              : <Save className="w-4 h-4" />
            }
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
