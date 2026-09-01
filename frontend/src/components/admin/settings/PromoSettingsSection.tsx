import React from 'react';
import { Image } from 'lucide-react';
import { ImageField } from './ImageField';

interface PromoSettingsSectionProps {
  promoBadge: string;
  onPromoBadgeChange: (val: string) => void;
  promoTitle: string;
  onPromoTitleChange: (val: string) => void;
  promoSubtitle: string;
  onPromoSubtitleChange: (val: string) => void;
  promoDescription: string;
  onPromoDescriptionChange: (val: string) => void;
  promoBtnText: string;
  onPromoBtnTextChange: (val: string) => void;
  promoBtnUrl: string;
  onPromoBtnUrlChange: (val: string) => void;
  promoCurrentImageUrl: string | null;
  promoPreview: string | null;
  onPromoPreviewChange: (val: string | null) => void;
  promoFileRef: React.RefObject<HTMLInputElement | null>;
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50';
const textareaCls = inputCls + ' resize-none';

export const PromoSettingsSection: React.FC<PromoSettingsSectionProps> = ({
  promoBadge,
  onPromoBadgeChange,
  promoTitle,
  onPromoTitleChange,
  promoSubtitle,
  onPromoSubtitleChange,
  promoDescription,
  onPromoDescriptionChange,
  promoBtnText,
  onPromoBtnTextChange,
  promoBtnUrl,
  onPromoBtnUrlChange,
  promoCurrentImageUrl,
  promoPreview,
  onPromoPreviewChange,
  promoFileRef,
}) => {
  return (
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
        onPreview={onPromoPreviewChange}
        hint="Format: JPEG, PNG, WEBP · Max: 10 Mo · Recommandé: 1200×500px"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Badge</label>
          <input
            type="text"
            value={promoBadge}
            onChange={(e) => onPromoBadgeChange(e.target.value)}
            className={inputCls}
            placeholder="ex: Jusqu'au 20 Août"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Titre</label>
          <input
            type="text"
            value={promoTitle}
            onChange={(e) => onPromoTitleChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Sous-titre</label>
          <input
            type="text"
            value={promoSubtitle}
            onChange={(e) => onPromoSubtitleChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton — Texte</label>
          <input
            type="text"
            value={promoBtnText}
            onChange={(e) => onPromoBtnTextChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
          <textarea
            rows={3}
            value={promoDescription}
            onChange={(e) => onPromoDescriptionChange(e.target.value)}
            className={textareaCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton — URL</label>
          <input
            type="text"
            value={promoBtnUrl}
            onChange={(e) => onPromoBtnUrlChange(e.target.value)}
            className={inputCls}
            placeholder="/shop"
          />
        </div>
      </div>
    </div>
  );
};
