import React, { useState } from 'react';
import { ShoppingBag, Eye, FileText, Filter, Clock, Truck, PackageCheck, XCircle } from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { useSEO } from '../../hooks/useSEO';
import { formatPrice } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

export const AdminOrdersPage: React.FC = () => {
  useSEO({ title: 'Gestion des Commandes | HAFROSE Admin', noIndex: true });

  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const { data: ordersData, isLoading, isError, refetch } = useAdminOrders({
    page,
    status: selectedStatus || undefined,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const ordersList = ordersData?.data || (Array.isArray(ordersData) ? ordersData : []);
  const meta = ordersData?.meta;

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert(err?.message || 'Erreur lors du changement de statut.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <PackageCheck className="w-3 h-3" /> Livrée
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/50">
            <Truck className="w-3 h-3" /> Expédiée
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
            <Clock className="w-3 h-3" /> En préparation
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/50">
            <XCircle className="w-3 h-3" /> Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
    }
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
        message="Impossible de charger les commandes depuis le serveur."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <div>
          <h2 className="font-serif text-xl text-white font-medium">Gestion des Commandes</h2>
          <p className="text-xs text-neutral-400">Suivi et expédition des commandes clients</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-amber-500/50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase text-neutral-400 tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Commande</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Montant</th>
                <th className="py-3.5 px-4">Statut Actuel</th>
                <th className="py-3.5 px-4">Mettre à jour Statut</th>
                <th className="py-3.5 px-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {ordersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <span>Aucune commande ne correspond aux critères.</span>
                  </td>
                </tr>
              ) : (
                ordersList.map((o: any) => (
                  <tr key={o.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">#{o.id}</p>
                      <p className="text-[10px] text-neutral-500">
                        {new Date(o.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-white">{o.customer_name || 'Client'}</p>
                      <p className="text-[10px] text-neutral-400">{o.city || 'Maroc'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">{o.phone || '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatPrice(Number(o.total_price))}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(o.status)}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        disabled={updateStatusMutation.isPending}
                        className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="pending">En attente</option>
                        <option value="processing">En préparation</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
                          title="Consulter"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`http://localhost:8000/api/admin/orders/${o.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded-lg transition-colors"
                          title="Facture PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-neutral-900 flex justify-center">
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-serif text-xl text-white">Commande #{selectedOrder.id}</h3>
                <p className="text-xs text-neutral-400">
                  {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-900/60 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 uppercase tracking-wider block text-[10px]">Client</span>
                  <span className="font-semibold text-white block mt-0.5">{selectedOrder.customer_name}</span>
                  <span className="text-neutral-400">{selectedOrder.phone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase tracking-wider block text-[10px]">Adresse</span>
                  <span className="font-semibold text-white block mt-0.5">
                    {selectedOrder.address || selectedOrder.city}
                  </span>
                  <span className="text-neutral-400">{selectedOrder.city}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-neutral-900/60 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 font-medium">Montant Total</span>
                <span className="font-serif text-xl text-amber-400 font-bold">
                  {formatPrice(Number(selectedOrder.total_price))}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
