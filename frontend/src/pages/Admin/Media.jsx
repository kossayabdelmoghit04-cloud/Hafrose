import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Swal from 'sweetalert2';
import Button from '../../components/ui/Button';
import { FiUpload, FiTrash2, FiImage, FiX, FiGrid } from 'react-icons/fi';

export default function Media() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Charger les médias paginés
  const { data: mediaData, isLoading, error } = useQuery({
    queryKey: ['adminMedia', page],
    queryFn: () => api.get(`/admin/media?page=${page}&per_page=18`).then(res => res),
    keepPreviousData: true,
  });

  // Mutation pour l'upload
  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post('/admin/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['adminMedia'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'Le téléversement a échoué.', 'error');
    },
    onSettled: () => setUploading(false),
  });

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/media/${id}`),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Supprimé !', 'Le média a été supprimé.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminMedia'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'La suppression a échoué.', 'error');
    },
  });

  const uploadFiles = (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploadNext = (index) => {
      if (index >= files.length) {
        setUploading(false);
        Swal.fire({
          icon: 'success',
          title: `${files.length} fichier(s) téléversé(s)`,
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }
      const formData = new FormData();
      formData.append('file', files[index]);
      uploadMutation.mutateAsync(formData)
        .then(() => uploadNext(index + 1))
        .catch(() => uploadNext(index + 1));
    };

    uploadNext(0);
  };

  const handleFileInput = (e) => {
    uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleDelete = (media) => {
    Swal.fire({
      title: 'Supprimer ce média ?',
      text: `"${media.filename}" sera supprimé du serveur et de la base de données.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111111',
      cancelButtonColor: '#7F7F7F',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(media.id);
      }
    });
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    Swal.fire({
      icon: 'success',
      title: 'URL copiée !',
      text: url,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  if (isLoading) return <Loader fullPage />;
  if (error) return <div className="text-red-500">Erreur : {error.message}</div>;

  const mediaList = mediaData?.data || [];
  const meta = mediaData?.meta || { current_page: 1, last_page: 1, total: 0 };

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-luxury-charcoal">Médiathèque</h2>
          <p className="text-sm text-luxury-gray">
            Gérez les images et fichiers réutilisables de la boutique.
            <span className="ml-2 font-semibold text-luxury-gold">{meta.total} fichier(s)</span>
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-luxury-gold bg-luxury-gold/10 scale-[1.01]'
            : 'border-luxury-gold/30 bg-white hover:border-luxury-gold hover:bg-luxury-gold/5'
        }`}
      >
        <FiUpload className={`w-10 h-10 mb-3 transition-all duration-300 ${isDragging ? 'text-luxury-gold scale-110' : 'text-luxury-gray'}`} />
        <p className="text-sm font-semibold text-luxury-charcoal">
          {uploading ? 'Téléversement en cours...' : 'Glissez-déposez vos fichiers ici'}
        </p>
        <p className="text-xs text-luxury-gray mt-1">ou cliquez pour sélectionner des fichiers</p>
        <p className="text-[10px] text-luxury-gray mt-2">PNG, JPG, WEBP, SVG, GIF (max 10 Mo par fichier)</p>
        <label className="absolute inset-0 cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Media Grid */}
      {mediaList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-4">
          {mediaList.map((media) => (
            <div
              key={media.id}
              className="group relative aspect-square bg-white border border-luxury-gold/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Image thumbnail */}
              <img
                src={media.url}
                alt={media.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-luxury-charcoal/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-all duration-200 p-2">
                {/* Copy URL button */}
                <button
                  onClick={() => copyToClipboard(media.url)}
                  title="Copier l'URL"
                  className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-charcoal flex items-center justify-center hover:scale-110 transition-transform duration-200"
                >
                  <FiImage className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(media)}
                  title="Supprimer"
                  className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform duration-200"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              {/* File info on bottom */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-[9px] text-white truncate">{media.filename}</p>
                <p className="text-[9px] text-white/60">
                  {(media.size / 1024).toFixed(0)} Ko
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-luxury-gold/20 rounded-lg text-luxury-gray">
          <FiGrid className="w-12 h-12 mb-4 text-luxury-light-gray" />
          <p className="font-semibold">La médiathèque est vide.</p>
          <p className="text-sm mt-1">Glissez-déposez des fichiers ou utilisez la zone ci-dessus.</p>
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-luxury-gold/10">
          <span className="text-xs text-luxury-gray">Page {meta.current_page} sur {meta.last_page}</span>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              variant="secondary"
              size="sm"
            >
              Précédent
            </Button>
            <Button
              onClick={() => setPage(p => Math.min(p + 1, meta.last_page))}
              disabled={page === meta.last_page}
              variant="secondary"
              size="sm"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
