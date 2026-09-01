import React from 'react';

interface GeneralSettingsSectionProps {
  siteName: string;
  onSiteNameChange: (val: string) => void;
  contactEmail: string;
  onContactEmailChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  currency: string;
  onCurrencyChange: (val: string) => void;
  shippingFee: string;
  onShippingFeeChange: (val: string) => void;
  freeShippingThreshold: string;
  onFreeShippingThresholdChange: (val: string) => void;
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50';

export const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  siteName,
  onSiteNameChange,
  contactEmail,
  onContactEmailChange,
  phone,
  onPhoneChange,
  currency,
  onCurrencyChange,
  shippingFee,
  onShippingFeeChange,
  freeShippingThreshold,
  onFreeShippingThresholdChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">Nom de la Marque</label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => onSiteNameChange(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">Email de Contact Support</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => onContactEmailChange(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">Téléphone Conciergerie</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">Devise Principale</label>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className={inputCls}
        >
          <option value="MAD">MAD (Dirham Marocain)</option>
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">Frais de Livraison De Base</label>
        <input
          type="number"
          value={shippingFee}
          onChange={(e) => onShippingFeeChange(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">Seuil Livraison Gratuite</label>
        <input
          type="number"
          value={freeShippingThreshold}
          onChange={(e) => onFreeShippingThresholdChange(e.target.value)}
          className={inputCls}
        />
      </div>
    </div>
  );
};
