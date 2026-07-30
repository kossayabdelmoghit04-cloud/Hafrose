import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BusinessAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await api.get('/admin/analytics');
        if (isMounted && res?.data) {
          setData(res.data);
        }
      } catch {
        // Fallback state si non authentifié en admin
        if (isMounted) {
          setData({
            total_revenue: 0,
            orders_count: 0,
            average_order_value: 0,
            conversion_rate: 0,
            total_customers: 0,
            customer_retention_rate: 0,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = data || {
    total_revenue: 0,
    orders_count: 0,
    average_order_value: 0,
    conversion_rate: 0,
    total_customers: 0,
    customer_retention_rate: 0,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-left">
      <div>
        <h1 className="font-serif text-3xl text-neutral-900 dark:text-amber-100">Business Analytics & Performance</h1>
        <p className="text-xs text-amber-600 uppercase tracking-widest mt-1">HAFROSE v2.0 Enterprise Intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-amber-900/20 shadow-md">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Chiffre d'Affaires</span>
          <p className="text-3xl font-serif text-amber-400 mt-2">
            {loading ? '...' : `${Number(metrics.total_revenue).toLocaleString('fr-FR')} €`}
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-amber-900/20 shadow-md">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Commandes Totales</span>
          <p className="text-3xl font-serif text-amber-100 mt-2">
            {loading ? '...' : metrics.orders_count}
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-amber-900/20 shadow-md">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Panier Moyen (AOV)</span>
          <p className="text-3xl font-serif text-amber-400 mt-2">
            {loading ? '...' : `${Number(metrics.average_order_value).toFixed(2)} €`}
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-amber-900/20 shadow-md">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Taux de Rétention</span>
          <p className="text-3xl font-serif text-emerald-400 mt-2">
            {loading ? '...' : `${metrics.customer_retention_rate}%`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalyticsDashboard;
