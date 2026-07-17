import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Swal from 'sweetalert2';
import { 
  FiSearch, 
  FiEye, 
  FiPrinter, 
  FiDownload, 
  FiX, 
  FiCheckCircle, 
  FiCalendar, 
  FiUser, 
  FiMapPin 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import AdminActionButton from '../../components/ui/AdminActionButton';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { Select } from '../../components/ui/form';

export default function Orders() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Détail d'une commande
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);

  // Charger les commandes
  const { data: ordersData, isLoading, error, isFetching } = useQuery({
    queryKey: ['adminOrders', page, search, statusFilter, dateFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', 10);
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      
      return api.get(`/admin/orders?${params.toString()}`).then(res => res);
    },
    keepPreviousData: true,
  });

  // Mutation pour modifier le statut
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Mis à jour !', 'Le statut de la commande a été modifié.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        if (selectedOrder && selectedOrder.id === res.data.id) {
          setSelectedOrder(res.data);
        }
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'La mise à jour a échoué.', 'error');
    }
  });

  // Télécharger le PDF de facture de manière sécurisée en tant que Blob
  const downloadInvoice = async (orderId) => {
    setDownloadingPdfId(orderId);
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${baseURL}/admin/orders/${orderId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Erreur de téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-hafrose-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      Swal.fire('Erreur', 'Impossible de générer le fichier PDF.', 'error');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const closeDetails = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };
  if (error) return (
    <Card variant="alert" animate={false}>
      <Card.Body><p className="text-red-500">Erreur : {error.message}</p></Card.Body>
    </Card>
  );

  const ordersList = ordersData?.data || [];
  const meta = ordersData?.meta || { current_page: 1, last_page: 1, total: 0 };

  const statuses = ['En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'];

  return (
    <div className="space-y-6 animate-fade-in-up print:bg-white print:p-0">
      
      {/* Title & Info */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-3xl font-serif text-luxury-charcoal">Gestion des Commandes</h2>
          <p className="text-sm text-luxury-gray">Suivez et traitez les commandes des clients.</p>
        </div>
      </div>

      {/* Orders Table System */}
      <Table aria-label="Liste des commandes" variant="admin" density="comfortable" resetPage={() => setPage(1)} className="print:hidden">
        <Table.Toolbar>
          <Table.Search
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Rechercher par n° de commande, client..."
          />
          <Table.Filter
            label="Statut"
            options={statuses.map(s => ({ value: s, label: s }))}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            allLabel="Tous les statuts"
          />
          <Table.DateFilter
            label="Date"
            value={dateFilter}
            onChange={(val) => { setDateFilter(val); setPage(1); }}
          />
          <Table.ResultCount count={meta.total} label="commande(s)" />
        </Table.Toolbar>

        <Table.Container>
          <Table.Head>
            <Table.HeadRow>
              <Table.HeadCell>Commande</Table.HeadCell>
              <Table.HeadCell>Client</Table.HeadCell>
              <Table.HeadCell hideBelow="sm">Date</Table.HeadCell>
              <Table.HeadCell hideBelow="lg">Ville</Table.HeadCell>
              <Table.HeadCell align="right">Montant</Table.HeadCell>
              <Table.HeadCell>Statut</Table.HeadCell>
              <Table.HeadCell align="right">Actions</Table.HeadCell>
            </Table.HeadRow>
          </Table.Head>

          <Table.Body loading={isLoading} skeletonRows={10} skeletonColumns={7} isFetching={isFetching}>
            {ordersList.map((order) => (
              <Table.Row key={order.id}>
                <Table.Cell className="font-mono text-xs font-semibold">N° {order.id}</Table.Cell>
                <Table.Cell>
                  <Table.PrimaryText>{order.customer_name}</Table.PrimaryText>
                </Table.Cell>
                <Table.Cell hideBelow="sm" className="text-luxury-gray">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </Table.Cell>
                <Table.Cell hideBelow="lg" className="text-luxury-gray">{order.city}</Table.Cell>
                <Table.Cell align="right" numeric>
                  {parseFloat(order.total_price).toFixed(2)} €
                </Table.Cell>
                <Table.Cell>
                  <Table.StatusBadge status={order.status} />
                </Table.Cell>
                <Table.Cell align="right">
                  <Table.RowActions>
                    <AdminActionButton
                      action="view"
                      onClick={() => openDetails(order)}
                      title="Consulter"
                    />
                    <AdminActionButton
                      action="download"
                      onClick={() => downloadInvoice(order.id)}
                      loading={downloadingPdfId === order.id}
                      title="Télécharger la facture PDF"
                    />
                  </Table.RowActions>
                </Table.Cell>
              </Table.Row>
            ))}

            <Table.Empty
              visible={ordersList.length === 0 && !isLoading}
              colSpan={7}
              icon={<FiShoppingCart />}
              title="Aucune commande trouvée"
              description="Les commandes des clients apparaîtront ici."
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

      {/* Modal - Order Details — Card variant="confirmation" */}
      <Modal isOpen={isDetailOpen} onClose={closeDetails} variant="confirmation" size="xl">
        <Modal.Backdrop className="print:hidden" />
        <Modal.Container className="w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] print:border-none print:shadow-none print:max-h-none print:w-full print:relative print:inset-auto print:bg-white print:p-0 print:z-auto">
          {/* Modal Header */}
          <Modal.Header className="px-6 py-4 bg-luxury-charcoal text-white border-b border-luxury-gold/20 print:hidden">
            <Modal.Title className="text-luxury-gold">
              Détail de la Commande N° {selectedOrder.id}
            </Modal.Title>
            <Modal.CloseButton className="text-luxury-gray hover:text-white" />
          </Modal.Header>

          {/* Modal Body (This is the print content area) */}
          <Modal.Body className="overflow-y-auto space-y-6 flex-grow print:p-0 print:overflow-visible">
              
              {/* Printed Logo block (visible only when printing) */}
              <div className="hidden print:flex justify-between items-center pb-6 border-b border-luxury-gold/20 mb-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-luxury-gold uppercase tracking-wider">Hafrose</h1>
                  <span className="text-[10px] text-luxury-gray uppercase tracking-widest block">Boutique de Luxe Paris</span>
                </div>
                <div className="text-right text-xs text-luxury-gray">
                  <strong>Facture N° :</strong> {selectedOrder.id}<br />
                  <strong>Date :</strong> {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Client & Shipping address panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                <Card variant="flat" size="sm" animate={false} className="print:shadow-none">
                  <Card.Content className="flex-col gap-2">
                    <div className="flex items-center gap-2 font-serif text-sm text-luxury-gold mb-3 font-semibold uppercase tracking-wider">
                      <FiUser />
                      <span>Facturé à</span>
                    </div>
                    <Card.Title as="div" className="text-sm font-semibold">{selectedOrder.customer_name}</Card.Title>
                    <Card.Meta>Téléphone : {selectedOrder.phone}</Card.Meta>
                  </Card.Content>
                </Card>

                <Card variant="flat" size="sm" animate={false} className="print:shadow-none">
                  <Card.Content className="flex-col gap-2">
                    <div className="flex items-center gap-2 font-serif text-sm text-luxury-gold mb-3 font-semibold uppercase tracking-wider">
                      <FiMapPin />
                      <span>Adresse de Livraison</span>
                    </div>
                    <Card.Description className="text-sm whitespace-pre-line">{selectedOrder.address}</Card.Description>
                    <Card.Title as="div" className="text-sm font-semibold mt-2">{selectedOrder.city}</Card.Title>
                  </Card.Content>
                </Card>
              </div>

              {/* Ordered Items Table */}
              <Table aria-label="Articles de la commande" variant="modal" density="compact" className="print:shadow-none">
                <Table.Container>
                  <Table.Head>
                    <Table.HeadRow>
                      <Table.HeadCell>Produit</Table.HeadCell>
                      <Table.HeadCell align="right">Prix</Table.HeadCell>
                      <Table.HeadCell align="center">Qté</Table.HeadCell>
                      <Table.HeadCell align="right">Sous-total</Table.HeadCell>
                    </Table.HeadRow>
                  </Table.Head>
                  <Table.Body>
                    {selectedOrder.order_items?.map((item) => (
                      <Table.Row key={item.id} hoverable={false}>
                        <Table.Cell>
                          <Table.PrimaryText>{item.product?.name || 'Produit supprimé'}</Table.PrimaryText>
                        </Table.Cell>
                        <Table.Cell align="right" numeric>
                          {parseFloat(item.unit_price).toFixed(2)} €
                        </Table.Cell>
                        <Table.Cell align="center">
                          {item.quantity}
                        </Table.Cell>
                        <Table.Cell align="right" numeric className="font-semibold">
                          {parseFloat(item.subtotal).toFixed(2)} €
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Container>
              </Table>

              {/* Calculations Block */}
              <div className="flex justify-end">
                <Table aria-label="Récapitulatif financier" variant="summary" density="compact" className="w-64">
                  <Table.Container>
                    <Table.Body>
                      <Table.Row hoverable={false}>
                        <Table.Cell className="text-luxury-gray font-semibold" align="right">Sous-total HT :</Table.Cell>
                        <Table.Cell align="right" numeric className="font-medium">
                          {(selectedOrder.total_price / 1.20).toFixed(2)} €
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row hoverable={false}>
                        <Table.Cell className="text-luxury-gray font-semibold" align="right">TVA (20%) :</Table.Cell>
                        <Table.Cell align="right" numeric className="font-medium">
                          {(selectedOrder.total_price - (selectedOrder.total_price / 1.20)).toFixed(2)} €
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row hoverable={false} className="border-t border-luxury-gold/30 font-bold text-base">
                        <Table.Cell className="text-luxury-charcoal" align="right">Total TTC :</Table.Cell>
                        <Table.Cell align="right" numeric className="text-luxury-gold font-bold">
                          {parseFloat(selectedOrder.total_price).toFixed(2)} €
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Container>
                </Table>
              </div>

          </Modal.Body>

            {/* Actions & Print tools */}
            <Modal.Footer className="print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs text-luxury-gray font-semibold uppercase">Modifier statut :</span>
                <Select
                  variant="admin"
                  size="sm"
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  options={statuses.map(s => ({ value: s, label: s }))}
                  className="text-xs uppercase font-bold"
                />
              </div>
              
              <Modal.Actions>
                <Button
                  onClick={handlePrint}
                  variant="secondary"
                  size="sm"
                  icon={<FiPrinter />}
                >
                  Imprimer
                </Button>
                <Button
                  onClick={() => downloadInvoice(selectedOrder.id)}
                  loading={downloadingPdfId === selectedOrder.id}
                  variant="primary"
                  size="sm"
                  icon={<FiDownload />}
                >
                  Facture PDF
                </Button>
              </Modal.Actions>
            </Modal.Footer>
          </Modal.Container>
        </Modal>

    </div>
  );
}
