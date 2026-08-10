import React from 'react';
import { TrendingUp, ShoppingBag, Sparkles } from 'lucide-react';
import { useAdminDashboard, useAdminAnalytics } from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';
import { formatPrice } from '../../utils/formatters';

export const AdminAnalyticsPage: React.FC = () => {
  useSEO({ title: 'Statistiques & Performance | HAFROSE Admin', noIndex: true });

  const { data: dashboardData, isLoading: isDashLoading, isError: isDashError, refetch } = useAdminDashboard();
  useAdminAnalytics();

  if (isDashLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="xl" variant="burgundy" />
      </div>
    );
  }

  if (isDashError || !dashboardData) {
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible de charger les données analytiques."
        onRetry={refetch}
      />
    );
  }

  const { metrics, sales_chart } = dashboardData;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <h2 className="font-serif text-xl text-white font-medium">Analytique & Performances Commerciales</h2>
        <p className="text-xs text-neutral-400">Rapports d'activité HAFROSE générés depuis la base de données</p>
      </div>

      {/* KPI HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <span>Revenu Global</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-serif text-3xl text-white font-bold mt-4">{formatPrice(metrics.revenue)}</p>
          <p className="text-[11px] text-neutral-400 mt-1">Chiffre d'affaires consolidé des ventes</p>
        </div>

        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <span>Volume Commandes</span>
            <ShoppingBag className="w-4 h-4 text-burgundy-400" />
          </div>
          <p className="font-serif text-3xl text-white font-bold mt-4">{metrics.orders_count}</p>
          <p className="text-[11px] text-neutral-400 mt-1">Commandes traitées sur la boutique</p>
        </div>

        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <span>Panier Moyen</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-3xl text-white font-bold mt-4">
            {metrics.orders_count > 0 ? formatPrice(metrics.revenue / metrics.orders_count) : formatPrice(0)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Valeur moyenne par commande</p>
        </div>
      </div>

      {/* SALES PERFORMANCE ANALYSIS */}
      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-6 shadow-lg space-y-6">
        <h3 className="font-serif text-lg text-white">Analyse des Ventes par Période</h3>

        <div className="space-y-4">
          {sales_chart.map((s) => {
            const max = Math.max(...sales_chart.map((item) => item.sales), 1);
            const ratio = Math.round((s.sales / max) * 100);

            return (
              <div key={s.date} className="flex items-center gap-4 text-xs">
                <span className="w-16 font-mono text-neutral-400">{s.date}</span>
                <div className="flex-1 bg-neutral-900 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-burgundy-800 to-amber-500 rounded-full"
                    style={{ width: `${Math.max(ratio, 2)}%` }}
                  />
                </div>
                <span className="w-28 text-right font-semibold text-white">{formatPrice(s.sales)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
