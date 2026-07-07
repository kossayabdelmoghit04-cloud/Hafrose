import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { FiUpload, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../ui/Modal';

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

  if (error) {
    return (
      <Modal isOpen={true} onClose={onClose} variant="alert" size="sm">
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Header>
            <Modal.Title className="text-red-500">Erreur de chargement</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <p className="text-red-400 text-center font-sans text-sm">Erreur: {error.message}</p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Actions>
              <Button onClick={onClose} variant="secondary" size="sm">Fermer</Button>
            </Modal.Actions>
          </Modal.Footer>
        </Modal.Container>
      </Modal>
    );
  }

  const mediaList = data?.data || [];
  const meta = data?.meta || { current_page: 1, last_page: 1 };

  return (
    <Modal isOpen={true} onClose={onClose} variant="confirmation" size="xl">
      <Modal.Backdrop />
      <Modal.Container className="h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <Modal.Header className="bg-luxury-charcoal text-white border-b border-luxury-gold/20">
          <div>
            <Modal.Title className="text-luxury-gold">Sélectionner un Média</Modal.Title>
            <Modal.Description className="text-[10px] text-luxury-gray uppercase tracking-widest block mt-1">
              Médiathèque Hafrose
            </Modal.Description>
          </div>
          <Modal.CloseButton className="text-luxury-gray hover:text-white" />
        </Modal.Header>

        {/* Content Body */}
        <Modal.Body className="flex-grow overflow-y-auto flex flex-col min-h-0 gap-6">
          
          {/* Quick upload zone — Card variant="flat" comme zone de dépôt */}
          <Card variant="flat" size="sm" animate={false} className="relative w-full border-2 border-dashed border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/5 transition-all duration-300">
            <label className="flex flex-col items-center justify-center w-full h-24 cursor-pointer">
              <Card.Content className="flex-col items-center justify-center text-center pointer-events-none">
                <FiUpload className="w-8 h-8 text-luxury-gold mb-2" />
                <p className="text-xs text-luxury-charcoal font-semibold">
                  {uploading ? 'Téléversement en cours...' : 'Cliquez pour ajouter une nouvelle image à la médiathèque'}
                </p>
                <p className="text-[10px] text-luxury-gray mt-1">PNG, JPG, WEBP, SVG (max 10 Mo)</p>
              </Card.Content>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </Card>

          {/* Grid display */}
          <div className="flex-grow min-h-0">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto max-h-[40vh] p-1">
                {mediaList.map((media) => (
                  <Card
                    key={media.id}
                    variant="media"
                    size="xs"
                    animate={false}
                    onClick={() => onSelect(media)}
                    className="group relative aspect-square overflow-hidden cursor-pointer"
                  >
                    <Card.Image
                      src={media.url}
                      alt={media.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <Card.Overlay className="items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-luxury-gold flex items-center justify-center text-luxury-charcoal">
                        <FiCheck className="w-5 h-5 font-bold" />
                      </div>
                    </Card.Overlay>
                  </Card>
                ))}
                {mediaList.length === 0 && (
                  <Card variant="empty" animate={false} className="col-span-full">
                    <Card.Body>
                      <p className="text-center py-10 text-luxury-gray text-sm">
                        Aucun média dans la bibliothèque. Ajoutez-en un ci-dessus !
                      </p>
                    </Card.Body>
                  </Card>
                )}
              </div>
            )}
          </div>
        </Modal.Body>

        {/* Footer with pagination */}
        <Modal.Footer className="bg-luxury-light-gray/40 border-t border-luxury-gold/10">
          <div className="text-xs text-luxury-gray">
            Page {meta.current_page} sur {meta.last_page}
          </div>
          <Modal.Actions>
            <Button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              variant="secondary"
              size="sm"
              icon={<FiChevronLeft />}
            >
              Précédent
            </Button>
            <Button
              onClick={() => setPage(p => Math.min(p + 1, meta.last_page))}
              disabled={page === meta.last_page}
              variant="secondary"
              size="sm"
              icon={<FiChevronRight />}
            >
              Suivant
            </Button>
          </Modal.Actions>
        </Modal.Footer>

      </Modal.Container>
    </Modal>
  );
}
