import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MESSAGES = [
  '✨ Nouvelle Collection — Découvrez nos dernières créations exclusives',
  '🚚 Livraison Gratuite dès 150 MAD d\'achat — Partout au Maroc',
  '👑 -20% sur les collections en promotion — Code : HAFROSE20',
];

export const AnnouncementBar = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % MESSAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative bg-burgundy-500 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 h-9 flex items-center justify-center gap-3 overflow-hidden">
        <button
          type="button"
          aria-label="Message précédent"
          onClick={() => setCurrent((c) => (c - 1 + MESSAGES.length) % MESSAGES.length)}
          className="hidden sm:flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <p
          key={current}
          className="text-caption font-sans font-medium tracking-wider text-center animate-fade-in truncate px-2"
        >
          {MESSAGES[current]}
        </p>

        <button
          type="button"
          aria-label="Message suivant"
          onClick={() => setCurrent((c) => (c + 1) % MESSAGES.length)}
          className="hidden sm:flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-xs"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
