import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  FolderTree,
  Mail,
  Star,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAdminDashboard } from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';
import { formatPrice } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  useSEO({ title: 'Tableau de Bord | HAFROSE Admin', noIndex: true });

  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="xl" variant="burgundy" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Impossible de charger le tableau de bord"
        message="Une erreur est survenue lors du chargement des statistiques en direct."
        onRetry={refetch}
      />

    );
  }

  const { metrics, sales_chart, popular_products, latest_orders, latest_messages } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Revenue */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-lg">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Chiffre d'Affaires
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">
              {formatPrice(metrics.revenue)}
            </p>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ventes validées HAFROSE</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-burgundy-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Commandes Totales
            </span>
            <div className="w-10 h-10 rounded-xl bg-burgundy-900/40 border border-burgundy-700/40 flex items-center justify-center text-burgundy-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">
              {metrics.orders_count}
            </p>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{metrics.pending_orders} en attente</span>
            </p>
          </div>
        </div>

        {/* Metric 3: Products */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-neutral-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Catalogue Produits
            </span>
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">
              {metrics.products_count}
            </p>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
              <FolderTree className="w-3.5 h-3.5 text-neutral-500" />
              <span>{metrics.categories_count} catégories actives</span>
            </p>
          </div>
        </div>

        {/* Metric 4: Customer Contact / Reviews */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-neutral-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Interactions Client
            </span>
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">
              {metrics.unread_contacts}
            </p>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>{metrics.pending_reviews} avis à modérer</span>
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS & POPULAR PRODUCTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Table / Chart Representation */}
        <div className="lg:col-span-2 bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-white font-medium">Tendance des Ventes</h2>
              <p className="text-xs text-neutral-400">Performances réelles des 15 derniers jours</p>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              Live Backend
            </span>
          </div>

          <div className="space-y-3">
            {sales_chart.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">Aucune donnée de vente enregistrée.</p>
            ) : (
              sales_chart.slice(-8).map((item) => {
                const maxSales = Math.max(...sales_chart.map((s) => s.sales), 1);
                const percent = Math.round((item.sales / maxSales) * 100);

                return (
                  <div key={item.date} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-neutral-400">{item.date}</span>
                      <span className="text-white font-semibold">
                        {formatPrice(item.sales)} ({item.count} cmd)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-burgundy-700 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-white font-medium">Produits Phares</h2>
            <NavLink to="/admin/products" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              <span>Voir tout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-4">
            {popular_products.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">Aucun produit vendu pour le moment.</p>
            ) : (
              popular_products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">{p.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-amber-400">{p.sales_qty} vendus</p>
                    <p className="text-[10px] text-neutral-400">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* LATEST ORDERS & RECENT MESSAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Orders */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-white font-medium">Commandes Récentes</h2>
            <NavLink to="/admin/orders" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              <span>Gérer les commandes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
                  <th className="py-2.5 px-3">Cmd #</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Montant</th>
                  <th className="py-2.5 px-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-xs">
                {latest_orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-400">
                      Aucune commande récente.
                    </td>
                  </tr>
                ) : (
                  latest_orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-white">#{o.id}</td>
                      <td className="py-3 px-3 text-neutral-300">{o.customer_name}</td>
                      <td className="py-3 px-3 font-semibold text-white">{formatPrice(Number(o.total_price))}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          o.status === 'delivered'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                            : o.status === 'cancelled'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Messages */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-white font-medium">Messages Contact Récents</h2>
            <NavLink to="/admin/contacts" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              <span>Messagerie</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {latest_messages.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Aucun message de contact.</p>
            ) : (
              latest_messages.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/60 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{m.name}</span>
                      {!m.is_read ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                          <AlertCircle className="w-2.5 h-2.5" /> Non lu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-neutral-500">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Lu
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 truncate">{m.subject}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{m.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
