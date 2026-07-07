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
  const { data: ordersData, isLoading, error } = useQuery({
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
        // Mettre à jour l'ordre ouvert s'il y en a un
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
      
      // Appel direct fetch/axios avec responseType blob pour porter le token
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

  if (isLoading) return <Loader fullPage />;
  if (error) return <div className="text-red-500">Erreur : {error.message}</div>;

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

      {/* Filter Row */}
      <div className="flex flex-wrap bg-white p-4 rounded border border-luxury-gold/10 gap-4 items-center shadow-sm print:hidden">
        
        {/* Search */}
        <div className="flex bg-luxury-light-gray/40 items-center gap-3 px-3 py-2 rounded border border-luxury-gold/10 w-full sm:max-w-xs">
          <FiSearch className="text-luxury-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par n° de commande, client..."
            className="bg-transparent border-none outline-none text-sm text-luxury-charcoal w-full"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white border border-luxury-gold/15 rounded text-sm outline-none cursor-pointer"
        >
          <option value="">Tous les statuts</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <FiCalendar className="text-luxury-gold" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-white border border-luxury-gold/15 rounded text-sm outline-none cursor-pointer"
          />
        </div>

        <div className="ml-auto text-xs text-luxury-gray font-semibold">
          {meta.total} commande(s) trouvée(s)
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-luxury-gold/10 rounded-lg shadow-sm overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-luxury-light-gray/40 border-b border-luxury-gold/10 text-xs text-luxury-gray uppercase tracking-wider">
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Ville</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersList.map((order) => (
                <tr key={order.id} className="border-b border-luxury-light-gray last:border-b-0 hover:bg-luxury-light-gray/20 transition-all duration-200">
                  <td className="px-6 py-4 font-mono text-xs font-semibold">N° {order.id}</td>
                  <td className="px-6 py-4 font-semibold text-luxury-charcoal">{order.customer_name}</td>
                  <td className="px-6 py-4 text-luxury-gray">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-luxury-gray">{order.city}</td>
                  <td className="px-6 py-4 font-semibold text-luxury-charcoal">
                    {parseFloat(order.total_price).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded font-bold uppercase cursor-pointer outline-none border border-transparent focus:border-luxury-gold ${
                        order.status === 'En attente' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'Confirmée' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Expédiée' ? 'bg-sky-100 text-sky-700' :
                        order.status === 'Livrée' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDetails(order)}
                        className="p-2 hover:bg-luxury-gold/10 text-luxury-charcoal hover:text-luxury-gold rounded transition-all duration-200"
                        title="Consulter"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadInvoice(order.id)}
                        disabled={downloadingPdfId === order.id}
                        className="p-2 hover:bg-luxury-gold/10 text-luxury-charcoal hover:text-luxury-gold rounded transition-all duration-200 disabled:opacity-50"
                        title="Télécharger la facture PDF"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ordersList.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-luxury-gray">
                    Aucune commande trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-luxury-gold/10 flex justify-between items-center print:hidden">
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

      {/* Modal - Order Details (Print Optimized) */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:relative print:inset-auto print:bg-white print:p-0 print:z-auto">
          <div className="w-full max-w-3xl bg-luxury-cream border border-luxury-gold/30 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:border-none print:shadow-none print:max-h-none print:w-full">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-luxury-charcoal text-white border-b border-luxury-gold/20 print:hidden">
              <h3 className="font-serif text-lg text-luxury-gold">Détail de la Commande N° {selectedOrder.id}</h3>
              <button onClick={closeDetails} className="p-1 text-luxury-gray hover:text-white rounded">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (This is the print content area) */}
            <div className="p-8 overflow-y-auto space-y-6 flex-grow print:p-0 print:overflow-visible">
              
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
                <div className="p-4 bg-white border border-luxury-gold/10 rounded shadow-sm print:shadow-none">
                  <div className="flex items-center gap-2 font-serif text-sm text-luxury-gold mb-3 font-semibold uppercase tracking-wider">
                    <FiUser />
                    <span>Facturé à</span>
                  </div>
                  <div className="text-sm font-semibold text-luxury-charcoal">{selectedOrder.customer_name}</div>
                  <div className="text-xs text-luxury-gray mt-1">Téléphone : {selectedOrder.phone}</div>
                </div>

                <div className="p-4 bg-white border border-luxury-gold/10 rounded shadow-sm print:shadow-none">
                  <div className="flex items-center gap-2 font-serif text-sm text-luxury-gold mb-3 font-semibold uppercase tracking-wider">
                    <FiMapPin />
                    <span>Adresse de Livraison</span>
                  </div>
                  <div className="text-sm text-luxury-charcoal whitespace-pre-line">{selectedOrder.address}</div>
                  <div className="text-sm font-semibold text-luxury-charcoal mt-2">{selectedOrder.city}</div>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="bg-white border border-luxury-gold/10 rounded shadow-sm print:shadow-none">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-luxury-light-gray/40 border-b border-luxury-gold/10 text-xs text-luxury-gray uppercase tracking-wider">
                      <th className="px-4 py-3">Produit</th>
                      <th className="px-4 py-3 text-right">Prix</th>
                      <th className="px-4 py-3 text-center">Qté</th>
                      <th className="px-4 py-3 text-right">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_items?.map((item) => (
                      <tr key={item.id} className="border-b border-luxury-light-gray last:border-b-0">
                        <td className="px-4 py-3 font-semibold text-luxury-charcoal">
                          {item.product?.name || 'Produit supprimé'}
                        </td>
                        <td className="px-4 py-3 text-right text-luxury-gray">
                          {parseFloat(item.unit_price).toFixed(2)} €
                        </td>
                        <td className="px-4 py-3 text-center text-luxury-charcoal">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-luxury-charcoal">
                          {parseFloat(item.subtotal).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations Block */}
              <div className="flex justify-end">
                <table className="w-64 text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 text-luxury-gray font-semibold text-right">Sous-total HT :</td>
                      <td className="py-2 text-right font-medium">{(selectedOrder.total_price / 1.20).toFixed(2)} €</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-luxury-gray font-semibold text-right">TVA (20%) :</td>
                      <td className="py-2 text-right font-medium">{(selectedOrder.total_price - (selectedOrder.total_price / 1.20)).toFixed(2)} €</td>
                    </tr>
                    <tr className="border-t border-luxury-gold/30 font-bold text-base">
                      <td className="py-3 text-luxury-charcoal text-right">Total TTC :</td>
                      <td className="py-3 text-right text-luxury-gold">{parseFloat(selectedOrder.total_price).toFixed(2)} €</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Actions & Print tools */}
              <div className="flex flex-wrap justify-between items-center gap-4 pt-6 border-t border-luxury-gold/15 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-luxury-gray font-semibold uppercase">Modifier statut :</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-luxury-gold/15 rounded text-xs outline-none cursor-pointer uppercase font-bold"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
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
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
