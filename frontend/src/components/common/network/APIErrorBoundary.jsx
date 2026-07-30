import React, { Component } from 'react';
import { FiRefreshCw, FiAlertOctagon } from 'react-icons/fi';

/**
 * HAFROSE — API Error Boundary (Phase 11)
 * 
 * React 19 Boundary that catches unhandled network failures or API exceptions cleanly,
 * preventing total screen crashes and providing graceful luxury recovery options.
 */
export class APIErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetBoundary = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetBoundary: this.resetBoundary,
        });
      }

      return (
        <div className="min-h-[300px] flex items-center justify-center p-8 bg-neutral-900/40 rounded-2xl border border-neutral-800 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <FiAlertOctagon className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-xl text-neutral-100 font-medium tracking-wide">
              Maison Hafrose — Indisponibilité Temporaire
            </h3>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Une interruption de la couche de service est survenue. Vos données restent protégées en toute sécurité.
            </p>

            <div className="pt-2">
              <button
                onClick={this.resetBoundary}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-lg transition-all inline-flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Recharger le composant
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
