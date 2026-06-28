import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { FiX, FiUpload, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function MediaPickerModal({ onClose, onSelect }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);

  // Charger les médias de la médiathèque
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminMedia', page],
    queryFn: () => api.get(`/admin/media?page=${page}&per_page=12`).then(res => res),
    keepPreviousData: true,
  });

  // Mutation pour l'upload d'un nouveau fichier
  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post('/admin/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Téléversé !', 'Le média a été ajouté à la bibliothèque.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminMedia'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'Le téléversement a échoué.', 'error');
    },
    onSettled: () => setUploading(false)
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      uploadMutation.mutate(formData);
    }
  };

  if (error) return <div className="text-red-500 p-4">Erreur: {error.message}</div>;

  const mediaList = data?.data || [];
  const meta = data?.meta || { current_page: 1, last_page: 1 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-luxury-cream border border-luxury-gold/30 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-luxury-charcoal text-white border-b border-luxury-gold/20">
          <div>
            <h3 className="font-serif text-lg text-luxury-gold">Sélectionner un Média</h3>
            <span className="text-[10px] text-luxury-gray uppercase tracking-widest block">Médiathèque Hafrose</span>
          </div>
          <button onClick={onClose} className="p-1 text-luxury-gray hover:text-white rounded">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto flex flex-col min-h-0">
          
          {/* Quick upload zone */}
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-luxury-gold/30 hover:border-luxury-gold bg-white hover:bg-luxury-gold/5 rounded-lg cursor-pointer transition-all duration-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-8 h-8 text-luxury-gold mb-2" />
                <p className="text-xs text-luxury-charcoal font-semibold">
                  {uploading ? 'Téléversement en cours...' : 'Cliquez pour ajouter une nouvelle image à la médiathèque'}
                </p>
                <p className="text-[10px] text-luxury-gray mt-1">PNG, JPG, WEBP, SVG (max 10 Mo)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Grid display */}
          <div className="flex-grow min-h-0">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto h-full max-h-[40vh] p-1">
                {mediaList.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => onSelect(media)}
                    className="group relative aspect-square bg-white border border-luxury-gold/10 rounded overflow-hidden cursor-pointer hover:border-luxury-gold shadow-sm hover:shadow transition-all duration-300"
                  >
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-luxury-charcoal/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                      <div className="w-8 h-8 rounded-full bg-luxury-gold flex items-center justify-center text-luxury-charcoal">
                        <FiCheck className="w-5 h-5 font-bold" />
                      </div>
                    </div>
                  </div>
                ))}
                {mediaList.length === 0 && (
                  <div className="col-span-full text-center py-10 text-luxury-gray">
                    Aucun média dans la bibliothèque. Ajoutez-en un ci-dessus !
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with pagination */}
        <div className="px-6 py-4 bg-luxury-light-gray/40 border-t border-luxury-gold/10 flex justify-between items-center">
          <div className="text-xs text-luxury-gray">
            Page {meta.current_page} sur {meta.last_page}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-white border border-luxury-gold/20 hover:border-luxury-gold text-xs rounded font-semibold disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, meta.last_page))}
              disabled={page === meta.last_page}
              className="px-3 py-1.5 bg-white border border-luxury-gold/20 hover:border-luxury-gold text-xs rounded font-semibold disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
            >
              Suivant
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
