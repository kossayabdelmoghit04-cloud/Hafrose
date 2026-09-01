import React from 'react';
import { Image } from 'lucide-react';
import { ImageField } from './ImageField';

interface HeroSettingsSectionProps {
  heroEyebrow: string;
  onHeroEyebrowChange: (val: string) => void;
  heroTitle: string;
  onHeroTitleChange: (val: string) => void;
  heroDescription: string;
  onHeroDescriptionChange: (val: string) => void;
  heroPrimaryBtnText: string;
  onHeroPrimaryBtnTextChange: (val: string) => void;
  heroPrimaryBtnUrl: string;
  onHeroPrimaryBtnUrlChange: (val: string) => void;
  heroSecondaryBtnText: string;
  onHeroSecondaryBtnTextChange: (val: string) => void;
  heroSecondaryBtnUrl: string;
  onHeroSecondaryBtnUrlChange: (val: string) => void;
  heroCurrentImageUrl: string | null;
  heroPreview: string | null;
  onHeroPreviewChange: (val: string | null) => void;
  heroFileRef: React.RefObject<HTMLInputElement | null>;
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50';
const textareaCls = inputCls + ' resize-none';

export const HeroSettingsSection: React.FC<HeroSettingsSectionProps> = ({
  heroEyebrow,
  onHeroEyebrowChange,
  heroTitle,
  onHeroTitleChange,
  heroDescription,
  onHeroDescriptionChange,
  heroPrimaryBtnText,
  onHeroPrimaryBtnTextChange,
  heroPrimaryBtnUrl,
  onHeroPrimaryBtnUrlChange,
  heroSecondaryBtnText,
  onHeroSecondaryBtnTextChange,
  heroSecondaryBtnUrl,
  onHeroSecondaryBtnUrlChange,
  heroCurrentImageUrl,
  heroPreview,
  onHeroPreviewChange,
  heroFileRef,
}) => {
  return (
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
        onPreview={onHeroPreviewChange}
        hint="Format: JPEG, PNG, WEBP · Max: 10 Mo · Recommandé: 1920×1080px"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Texte Eyebrow (label au-dessus)</label>
          <input
            type="text"
            value={heroEyebrow}
            onChange={(e) => onHeroEyebrowChange(e.target.value)}
            className={inputCls}
            placeholder="ex: Collection Printemps — Été 2025"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Titre Principal (h1)</label>
          <input
            type="text"
            value={heroTitle}
            onChange={(e) => onHeroTitleChange(e.target.value)}
            className={inputCls}
            placeholder="ex: L'Art de la Féminité"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
          <textarea
            rows={3}
            value={heroDescription}
            onChange={(e) => onHeroDescriptionChange(e.target.value)}
            className={textareaCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton Principal — Texte</label>
          <input
            type="text"
            value={heroPrimaryBtnText}
            onChange={(e) => onHeroPrimaryBtnTextChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton Principal — URL</label>
          <input
            type="text"
            value={heroPrimaryBtnUrl}
            onChange={(e) => onHeroPrimaryBtnUrlChange(e.target.value)}
            className={inputCls}
            placeholder="/shop"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton Secondaire — Texte</label>
          <input
            type="text"
            value={heroSecondaryBtnText}
            onChange={(e) => onHeroSecondaryBtnTextChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton Secondaire — URL</label>
          <input
            type="text"
            value={heroSecondaryBtnUrl}
            onChange={(e) => onHeroSecondaryBtnUrlChange(e.target.value)}
            className={inputCls}
            placeholder="/shop"
          />
        </div>
      </div>
    </div>
  );
};
