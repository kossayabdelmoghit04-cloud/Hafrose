import React from 'react';
import { Outlet, Link } from 'react-router-dom';

/**
 * Auth Layout Architecture
 * Responsibilities:
 * - Minimalist luxury framing for authentication screens (Login / Register / Password Reset)
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-block group focus:outline-none">
          <span className="font-serif text-h2 md:text-display-sm tracking-luxury-wide text-neutral-950 block group-hover:text-burgundy-600 transition-colors duration-200">
            HAFROSE
          </span>
          <span className="text-caption font-sans font-semibold tracking-luxury uppercase text-burgundy-500 block mt-1">
            Maison de Haute Couture
          </span>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-md shadow-hafrose-modal border border-neutral-200/80">
        <Outlet />
      </div>

      {/* Footer copyright */}
      <p className="text-caption text-neutral-500 mt-8 text-center">
        © {new Date().getFullYear()} HAFROSE. Tous droits réservés.
      </p>
    </div>
  );
};
