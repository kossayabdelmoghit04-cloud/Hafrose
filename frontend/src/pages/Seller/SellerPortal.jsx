import React from 'react';

const SellerPortal = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="border-b border-amber-900/20 pb-4">
        <span className="text-xs text-amber-600 uppercase tracking-widest font-mono">Architecture Marketplace Multi-Vendeurs</span>
        <h1 className="font-serif text-3xl text-neutral-900 dark:text-amber-100 mt-1">Espace Partenaire & Créateurs</h1>
      </div>

      <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-amber-900/20 shadow-xl space-y-4">
        <h3 className="font-serif text-xl text-amber-300">Rejoindre la Conciergerie HAFROSE</h3>
        <p className="text-sm text-neutral-400">
          Proposez vos créations d'exception à notre communauté de membres privilégiés.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <span className="text-xs text-amber-500 uppercase">Commission Spécifique</span>
            <p className="text-2xl font-serif text-amber-100 mt-1">10.00%</p>
          </div>
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <span className="text-xs text-amber-500 uppercase">Visibilité Internationale</span>
            <p className="text-2xl font-serif text-amber-100 mt-1">Global</p>
          </div>
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <span className="text-xs text-amber-500 uppercase">Support dédié</span>
            <p className="text-2xl font-serif text-amber-100 mt-1">24/7 VIP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPortal;
