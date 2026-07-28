import React from 'react';

const SocialShareModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`Découvrez "${product.name}" chez HAFROSE — L'Élégance Marocaine #HafrosePrivilege`);

  const shareLinks = [
    {
      name: 'Instagram',
      icon: '📸',
      url: `https://www.instagram.com/`,
      color: 'bg-gradient-to-r from-purple-600 to-pink-500',
      note: 'Copiez le lien ci-dessous',
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      color: 'bg-blue-600',
    },
    {
      name: 'TikTok',
      icon: '🎵',
      url: `https://www.tiktok.com/`,
      color: 'bg-neutral-900',
      note: 'Copiez le lien ci-dessous',
    },
    {
      name: 'Pinterest',
      icon: '📌',
      url: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
      color: 'bg-red-600',
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      color: 'bg-green-500',
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-amber-900/20 shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-lg text-neutral-900 dark:text-amber-100">Partager cette Création</h3>
            <p className="text-xs text-neutral-400">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">✕</button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {shareLinks.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.color} text-white rounded-xl p-3 flex flex-col items-center gap-1 text-center hover:opacity-90 transition-opacity`}
            >
              <span className="text-xl">{s.icon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">{s.name}</span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2">
          <input
            type="text"
            readOnly
            value={window.location.href}
            className="flex-1 bg-transparent text-xs text-neutral-600 dark:text-neutral-300 focus:outline-none"
          />
          <button
            onClick={copyLink}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 text-xs rounded font-semibold transition-colors"
          >
            Copier
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
