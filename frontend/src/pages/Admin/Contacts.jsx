import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Swal from 'sweetalert2';
import { 
  FiSearch, 
  FiMail, 
  FiTrash2, 
  FiEye, 
  FiX, 
  FiCheckCircle, 
  FiPhone 
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import AdminActionButton from '../../components/ui/AdminActionButton';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';


export default function Contacts() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '0' (non lu), '1' (lu) ou '' (tous)
  
  // Détail d'un message
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Charger les messages de contact
  const { data: contactsData, isLoading, error } = useQuery({
    queryKey: ['adminContacts', page, search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', 10);
      if (search) params.append('search', search);
      if (statusFilter !== '') params.append('is_read', statusFilter);
      
      return api.get(`/admin/contacts?${params.toString()}`).then(res => res);
    },
    keepPreviousData: true,
  });

  // Mutation pour marquer comme lu
  const readMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/contacts/${id}/read`),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      }
    }
  });

  // Mutation pour supprimer
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/contacts/${id}`),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Supprimé !', 'Le message a été supprimé.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'La suppression a échoué.', 'error');
    }
  });

  const openDetails = (message) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);
    
    // Marquer automatiquement comme lu s'il n'était pas lu
    if (!message.is_read) {
      readMutation.mutate(message.id);
    }
  };

  const closeDetails = () => {
    setIsDetailOpen(false);
    setSelectedMessage(null);
  };

  const handleDelete = (message) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous allez supprimer définitivement le message de "${message.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111111',
      cancelButtonColor: '#7F7F7F',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(message.id);
        if (selectedMessage && selectedMessage.id === message.id) {
          closeDetails();
        }
      }
    });
  };

  if (isLoading) return <Loader fullPage />;
  if (error) return (
    <Card variant="alert" animate={false}>
      <Card.Body><p className="text-red-500">Erreur : {error.message}</p></Card.Body>
    </Card>
  );

  const contactsList = contactsData?.data || [];
  const meta = contactsData?.meta || { current_page: 1, last_page: 1, total: 0 };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-serif text-luxury-charcoal">Messages de Contact</h2>
        <p className="text-sm text-luxury-gray">Consultez et répondez aux messages laissés par les utilisateurs.</p>
      </div>

      {/* Filter Row — Card variant="flat" comme panneau de filtres */}
      <Card variant="flat" size="sm" animate={false}>
        <Card.Content className="flex-wrap flex-row gap-4 items-center py-3 px-4">
          
          {/* Search */}
          <div className="flex bg-luxury-light-gray/40 items-center gap-3 px-3 py-2 rounded border border-luxury-gold/10 w-full sm:max-w-xs">
            <FiSearch className="text-luxury-gray" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par nom, email, sujet..."
              className="bg-transparent border-none outline-none text-sm text-luxury-charcoal w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-luxury-gold/15 rounded text-sm outline-none cursor-pointer"
          >
            <option value="">Tous les messages</option>
            <option value="0">Non lus</option>
            <option value="1">Lus</option>
          </select>

          <div className="ml-auto text-xs text-luxury-gray font-semibold">
            {meta.total} message(s) trouvé(s)
          </div>
        </Card.Content>
      </Card>

      {/* Messages List / Table — Card variant="admin" comme panneau contenant le tableau */}
      <Card variant="admin" size="md" animate={false} className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-luxury-light-gray/40 border-b border-luxury-gold/10 text-xs text-luxury-gray uppercase tracking-wider">
                <th className="px-6 py-4 w-12">État</th>
                <th className="px-6 py-4">Expéditeur</th>
                <th className="px-6 py-4">Sujet</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contactsList.map((msg) => (
                <tr 
                  key={msg.id} 
                  className={`border-b border-luxury-light-gray last:border-b-0 hover:bg-luxury-light-gray/25 transition-all duration-200 cursor-pointer ${
                    !msg.is_read ? 'bg-luxury-gold/5 font-semibold text-luxury-charcoal' : 'text-luxury-gray'
                  }`}
                  onClick={() => openDetails(msg)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {!msg.is_read ? (
                      <span className="w-2.5 h-2.5 bg-luxury-gold rounded-full block" title="Non lu"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 bg-transparent rounded-full block"></span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-luxury-charcoal">{msg.name}</div>
                    <div className="text-xs font-normal text-luxury-gray">{msg.email}</div>
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs">{msg.subject}</td>
                  <td className="px-6 py-4 font-normal text-xs">
                    {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <AdminActionButton
                        action="view"
                        onClick={() => openDetails(msg)}
                        title="Consulter"
                      />
                      <AdminActionButton
                        action="delete"
                        onClick={() => handleDelete(msg)}
                        title="Supprimer"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {contactsList.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-luxury-gray">
                    Aucun message reçu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-luxury-gold/10 flex justify-between items-center">
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
      </Card>

      {/* Modal - Message Details — Card variant="confirmation" */}
      <Modal isOpen={isDetailOpen} onClose={closeDetails} variant="confirmation" size="lg">
        <Modal.Backdrop />
        <Modal.Container className="w-full max-w-lg overflow-hidden flex flex-col">
          {/* Modal Header */}
          <Modal.Header className="px-6 py-4 bg-luxury-charcoal text-white border-b border-luxury-gold/20">
            <div className="flex items-center gap-2">
              <FiMail className="text-luxury-gold" />
              <Modal.Title className="text-sm uppercase tracking-wider text-luxury-gold font-serif">
                Consulter le Message
              </Modal.Title>
            </div>
            <Modal.CloseButton className="text-luxury-gray hover:text-white" />
          </Modal.Header>

          {/* Modal Body */}
          <Modal.Body className="space-y-6">
              
              {/* Sender Details */}
              <Card.Divider />
              <div className="pb-4 space-y-2">
                <div className="flex justify-between">
                  <Card.Meta className="uppercase tracking-widest font-bold">De</Card.Meta>
                  <Card.Meta className="font-mono">
                    {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                  </Card.Meta>
                </div>
                <Card.Title as="div" className="text-sm font-semibold">{selectedMessage.name}</Card.Title>
                <Card.Meta>{selectedMessage.email}</Card.Meta>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-luxury-gray mt-1">
                    <FiPhone className="w-3.5 h-3.5" />
                    <span>{selectedMessage.phone}</span>
                  </div>
                )}
              </div>

              {/* Subject & Message text */}
              <div className="space-y-3">
                <div>
                  <Card.Meta className="uppercase tracking-widest font-bold block mb-1">Objet</Card.Meta>
                  <Card.Description className="text-sm font-semibold bg-white p-3 rounded border border-luxury-gold/10">
                    {selectedMessage.subject}
                  </Card.Description>
                </div>
                <div>
                  <Card.Meta className="uppercase tracking-widest font-bold block mb-1">Message</Card.Meta>
                  <p className="text-xs text-luxury-gray bg-white p-4 rounded border border-luxury-gold/10 whitespace-pre-line leading-relaxed h-48 overflow-y-auto">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

            </Modal.Body>

            {/* Actions Footer */}
            <Modal.Footer>
              <Modal.Actions>
                <Button
                  type="button"
                  onClick={() => handleDelete(selectedMessage)}
                  variant="danger"
                  size="sm"
                  icon={<FiTrash2 />}
                >
                  Supprimer
                </Button>
                <Button
                  type="button"
                  onClick={closeDetails}
                  variant="primary"
                  size="sm"
                >
                  Fermer
                </Button>
              </Modal.Actions>
            </Modal.Footer>
          </Modal.Container>
        </Modal>

    </div>
  );
}
