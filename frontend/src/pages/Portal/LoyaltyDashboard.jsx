import React, { useState, useEffect } from 'react';

const LoyaltyDashboard = () => {
  const [account, setAccount] = useState({ points_balance: 350, lifetime_points: 1250, tier: 'Silver' });

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-amber-900/20 shadow-xl max-w-4xl mx-auto my-8">
      <div className="flex items-center justify-between border-b border-amber-900/20 pb-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-neutral-900 dark:text-amber-100">Programme Privilège HAFROSE</h2>
          <p className="text-xs text-amber-600 dark:text-amber-400">Avantages & Récompenses VIP Exclusives</p>
        </div>
        <span className="px-3 py-1 bg-amber-900/20 border border-amber-500/40 text-amber-400 text-xs rounded-full uppercase tracking-widest font-mono">
          Statut : {account.tier}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-5 bg-gradient-to-br from-amber-950/40 to-neutral-900 rounded-xl border border-amber-900/30">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Solde de Points</span>
          <p className="text-4xl font-serif text-amber-300 mt-2">{account.points_balance} pts</p>
          <p className="text-[11px] text-neutral-400 mt-2">Equivaut à 35€ de remise sur vos prochains achats</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-neutral-900 to-amber-950/40 rounded-xl border border-amber-900/30">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Points Cumulés à Vie</span>
          <p className="text-4xl font-serif text-amber-100 mt-2">{account.lifetime_points} pts</p>
          <p className="text-[11px] text-amber-400 mt-2">Plus que 750 pts pour atteindre le rang Gold</p>
        </div>
      </div>

      <h3 className="font-serif text-lg text-neutral-900 dark:text-amber-100 mb-4">Récompenses Débloquées</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-amber-900/10">
          <div>
            <h4 className="font-semibold text-sm text-neutral-900 dark:text-amber-200">Bon de Réduction 25€ Privé</h4>
            <p className="text-xs text-neutral-500">Coût : 250 points</p>
          </div>
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded font-semibold transition-colors">
            Échanger
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;
