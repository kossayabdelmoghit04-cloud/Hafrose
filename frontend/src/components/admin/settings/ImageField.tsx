import React from 'react';
import { Upload, X } from 'lucide-react';
import { getImageUrl } from '../../../utils/formatters';

export interface ImageFieldProps {
  label: string;
  currentUrl?: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
  previewUrl: string | null;
  onPreview: (url: string | null) => void;
  hint?: string;
}

export const ImageField: React.FC<ImageFieldProps> = ({
  label,
  currentUrl,
  fileRef,
  previewUrl,
  onPreview,
  hint,
}) => {
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
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                onPreview(null);
                if (fileRef.current) fileRef.current.value = '';
              }}
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
