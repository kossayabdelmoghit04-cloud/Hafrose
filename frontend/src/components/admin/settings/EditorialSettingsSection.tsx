import React from 'react';
import { Image } from 'lucide-react';
import { ImageField } from './ImageField';

interface EditorialSettingsSectionProps {
  editorialBadge: string;
  onEditorialBadgeChange: (val: string) => void;
  editorialTitle: string;
  onEditorialTitleChange: (val: string) => void;
  editorialDescription: string;
  onEditorialDescriptionChange: (val: string) => void;
  editorialQuote: string;
  onEditorialQuoteChange: (val: string) => void;
  editorialBtnText: string;
  onEditorialBtnTextChange: (val: string) => void;
  editorialBtnUrl: string;
  onEditorialBtnUrlChange: (val: string) => void;
  editorialCurrentImageUrl: string | null;
  editorialPreview: string | null;
  onEditorialPreviewChange: (val: string | null) => void;
  editorialFileRef: React.RefObject<HTMLInputElement | null>;
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50';
const textareaCls = inputCls + ' resize-none';

export const EditorialSettingsSection: React.FC<EditorialSettingsSectionProps> = ({
  editorialBadge,
  onEditorialBadgeChange,
  editorialTitle,
  onEditorialTitleChange,
  editorialDescription,
  onEditorialDescriptionChange,
  editorialQuote,
  onEditorialQuoteChange,
  editorialBtnText,
  onEditorialBtnTextChange,
  editorialBtnUrl,
  onEditorialBtnUrlChange,
  editorialCurrentImageUrl,
  editorialPreview,
  onEditorialPreviewChange,
  editorialFileRef,
}) => {
  return (
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
        onPreview={onEditorialPreviewChange}
        hint="Format: JPEG, PNG, WEBP · Max: 10 Mo · Recommandé: 800×600px (4:3)"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Badge</label>
          <input
            type="text"
            value={editorialBadge}
            onChange={(e) => onEditorialBadgeChange(e.target.value)}
            className={inputCls}
            placeholder="ex: Édition Limitée"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Titre</label>
          <input
            type="text"
            value={editorialTitle}
            onChange={(e) => onEditorialTitleChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
          <textarea
            rows={3}
            value={editorialDescription}
            onChange={(e) => onEditorialDescriptionChange(e.target.value)}
            className={textareaCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Citation (italique)</label>
          <textarea
            rows={2}
            value={editorialQuote}
            onChange={(e) => onEditorialQuoteChange(e.target.value)}
            className={textareaCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton — Texte</label>
          <input
            type="text"
            value={editorialBtnText}
            onChange={(e) => onEditorialBtnTextChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Bouton — URL</label>
          <input
            type="text"
            value={editorialBtnUrl}
            onChange={(e) => onEditorialBtnUrlChange(e.target.value)}
            className={inputCls}
            placeholder="/shop"
          />
        </div>
      </div>
    </div>
  );
};
