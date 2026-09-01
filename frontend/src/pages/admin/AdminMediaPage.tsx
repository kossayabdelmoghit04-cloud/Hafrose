import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Copy, Check, XCircle } from 'lucide-react';
import { useAdminMedia, useUploadMedia, useDeleteMedia } from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { LazyImage } from '../../components/ui/LazyImage/LazyImage';
import { useSEO } from '../../hooks/useSEO';
import { getImageUrl } from '../../utils/formatters';
import { Media } from '../../types/models';

export const AdminMediaPage: React.FC = () => {
  useSEO({ title: 'Médiathèque | HAFROSE Admin', noIndex: true });

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');

  const { data: mediaData, isLoading, isError, refetch } = useAdminMedia();
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();

  const mediaList: Media[] = mediaData?.data || (Array.isArray(mediaData) ? (mediaData as Media[]) : []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadMutation.mutateAsync(formData);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors du téléversement de l image.';
      setUploadError(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous supprimer ce média ?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la suppression.';
        alert(errorMsg);
      }
    }
  };

  const handleCopyUrl = (id: number, url: string) => {
    navigator.clipboard.writeText(getImageUrl(url));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
        message="Impossible de charger la médiathèque."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER & UPLOAD CONTROL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <div>
          <h2 className="font-serif text-xl text-white font-medium">Médiathèque HAFROSE</h2>
          <p className="text-xs text-neutral-400">Gestion des ressources visuelles et assets</p>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-burgundy-800 hover:bg-burgundy-700 text-white text-sm font-medium rounded-xl transition-all shadow-md">
          <Upload className="w-4 h-4" />
          <span>Téléverser un fichier</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {uploadError && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* MEDIA GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaList.length === 0 ? (
          <div className="col-span-full py-16 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 text-center text-neutral-400 space-y-2">
            <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-medium">Aucun fichier média trouvé.</p>
          </div>
        ) : (
          mediaList.map((m: Media) => {
            const url = m.url || m.path || '';
            const fullUrl = getImageUrl(url);

            return (
              <div
                key={m.id}
                className="group relative bg-neutral-950 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/40 transition-all flex flex-col"
              >
                <div className="aspect-square bg-neutral-900 relative overflow-hidden">
                  <LazyImage src={fullUrl} alt={m.name || m.file_name || 'Media asset'} className="w-full h-full object-cover" />

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(m.id, url)}
                      className="p-2 bg-neutral-900/90 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Copier l'URL"
                    >
                      {copiedId === m.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 bg-rose-900/90 text-white rounded-lg hover:bg-rose-800 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/90 border-t border-neutral-900">
                  <p className="text-xs font-semibold text-white truncate">{m.name || m.file_name || `Asset #${m.id}`}</p>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">{String(m.size || m.file_size || 'Image')}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminMediaPage;
