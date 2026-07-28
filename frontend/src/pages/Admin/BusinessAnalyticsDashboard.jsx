import React, { useState, useEffect } from 'react';

const BusinessAnalyticsDashboard = () => {
  const [data, setData] = useState({
    total_revenue: 45280,
    orders_count: 142,
    average_order_value: 318.87,
    conversion_rate: 3.42,
    total_customers: 580,
    customer_retention_rate: 68.5,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-neutral-900 dark:text-amber-100">Business Analytics & Performance</h1>
        <p className="text-xs text-amber-600 uppercase tracking-widest mt-1">HAFROSE v2.0 Enterprise Intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-amber-900/20 shadow-md">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Chiffre d'Affaires</span>
          <p className="text-3xl font-serif text-amber-400 mt-2">{data.total_revenue} €</p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-amber-900/20 shadow-md">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Commandes Totales</span>
          <p className="text-3xl font-serif text-amber-100 mt-2">{data.orders_count}</p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-amber-900/20 shadow-md">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Panier Moyen (AOV)</span>
          <p className="text-3xl font-serif text-amber-400 mt-2">{data.average_order_value} €</p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-amber-900/20 shadow-md">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Taux de Rétention</span>
          <p className="text-3xl font-serif text-emerald-400 mt-2">{data.customer_retention_rate}%</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalyticsDashboard;
