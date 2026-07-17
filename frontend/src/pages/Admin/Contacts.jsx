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
import Table from '../../components/ui/Table';


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

      {/* Messages Table System */}
      <Table aria-label="Messages de contact" variant="admin" density="comfortable" resetPage={() => setPage(1)}>
        <Table.Toolbar>
          <Table.Search
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Rechercher par nom, email, sujet..."
          />
          <Table.Filter
            label="Statut"
            options={[
              { value: '0', label: 'Non lus' },
              { value: '1', label: 'Lus' }
            ]}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            allLabel="Tous les messages"
          />
          <Table.ResultCount count={meta.total} label="message(s)" />
        </Table.Toolbar>

        <Table.Container>
          <Table.Head>
            <Table.HeadRow>
              <Table.HeadCell width="w-12">État</Table.HeadCell>
              <Table.HeadCell>Expéditeur</Table.HeadCell>
              <Table.HeadCell>Sujet</Table.HeadCell>
              <Table.HeadCell hideBelow="md">Date</Table.HeadCell>
              <Table.HeadCell align="right">Actions</Table.HeadCell>
            </Table.HeadRow>
          </Table.Head>

          <Table.Body loading={isLoading} skeletonRows={10} skeletonColumns={5}>
            {contactsList.map((msg) => (
              <Table.Row
                key={msg.id}
                clickable
                onClick={() => openDetails(msg)}
                selected={selectedMessage?.id === msg.id}
                className={!msg.is_read ? 'bg-luxury-gold/5 font-semibold text-luxury-charcoal' : 'text-luxury-gray'}
              >
                <Table.Cell onClick={(e) => e.stopPropagation()}>
                  <Table.StatusBadge status={msg.is_read ? 'read' : 'unread'} dot />
                </Table.Cell>
                <Table.Cell>
                  <Table.PrimaryText>{msg.name}</Table.PrimaryText>
                  <Table.SecondaryText>{msg.email}</Table.SecondaryText>
                </Table.Cell>
                <Table.Cell truncate>{msg.subject}</Table.Cell>
                <Table.Cell hideBelow="md" numeric>
                  {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </Table.Cell>
                <Table.Cell align="right" onClick={(e) => e.stopPropagation()}>
                  <Table.RowActions>
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
                  </Table.RowActions>
                </Table.Cell>
              </Table.Row>
            ))}

            <Table.Empty
              visible={contactsList.length === 0 && !isLoading}
              colSpan={5}
              icon={<FiMail />}
              title="Aucun message reçu"
              description="Les messages envoyés par les visiteurs du site apparaîtront ici."
            />
          </Table.Body>
        </Table.Container>

        <Table.Footer>
          <Table.Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            onPrev={() => setPage(p => Math.max(p - 1, 1))}
            onNext={() => setPage(p => Math.min(p + 1, meta.last_page))}
          />
        </Table.Footer>
      </Table>

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
