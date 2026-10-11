import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAdminThemeStore } from '../../stores/useAdminThemeStore';

interface AdminThemeToggleProps {
  className?: string;
}

export const AdminThemeToggle: React.FC<AdminThemeToggleProps> = ({ className = '' }) => {
  const { adminTheme, toggleAdminTheme } = useAdminThemeStore();
  const isDark = adminTheme === 'dark';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAdminTheme();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      id="admin-theme-toggle"
      data-testid="admin-theme-toggle"
      aria-checked={isDark}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      onClick={toggleAdminTheme}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
        isDark
          ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-300 border-neutral-800'
          : 'bg-cream-100 hover:bg-cream-200 text-burgundy-700 border-cream-300'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-amber-400 transition-transform duration-200 scale-100 rotate-0" aria-hidden="true" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-600 transition-transform duration-200 scale-100 rotate-0" aria-hidden="true" />
        )}
      </div>
      <span className="hidden sm:inline font-sans text-xs font-medium">
        {isDark ? 'Sombre' : 'Clair'}
      </span>
      <span className="sr-only">
        {isDark ? 'Mode sombre actif, cliquer pour mode clair' : 'Mode clair actif, cliquer pour mode sombre'}
      </span>
    </button>
  );
};
