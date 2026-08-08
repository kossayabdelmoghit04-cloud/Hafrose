import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI. Receives error and a reset handler. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Called when an error is caught — use for monitoring/reporting */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * GlobalErrorBoundary
 *
 * A class-based error boundary (required by React) that:
 * - Catches rendering errors from any descendant
 * - Shows a premium HAFROSE-branded fallback UI
 * - Provides a reset mechanism to re-mount the subtree
 * - Accepts a custom fallback render prop for flexibility
 * - Reports errors to an optional monitoring hook
 */
export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      console.error('[HAFROSE] Uncaught Error:', error.message, errorInfo.componentStack);
    }
  }

  reset(): void {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback(error, this.reset);
      }

      return <DefaultErrorFallback error={error} onReset={this.reset} />;
    }

    return children;
  }
}

/* ─────────────────────────────────────────────────────────────
   Default Luxury Error Fallback
   ───────────────────────────────────────────────────────────── */
interface DefaultErrorFallbackProps {
  error: Error;
  onReset: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, onReset }) => (
  <div
    role="alert"
    aria-live="assertive"
    className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center bg-cream-100"
  >
    {/* Decorative mark */}
    <div className="w-16 h-px bg-burgundy-200 mb-8 mx-auto" aria-hidden="true" />

    <h1 className="font-serif text-h3 text-burgundy-800 mb-3">
      Une erreur est survenue
    </h1>
    <p className="font-sans text-body-sm text-neutral-500 max-w-md mb-2">
      Nous n'avons pas pu charger cette page. Nos équipes ont été notifiées.
    </p>

    {import.meta.env.DEV && (
      <p className="font-mono text-caption text-error-500 bg-error-50 border border-error-100 rounded-sm px-4 py-2 max-w-lg mb-6 break-all">
        {error.message}
      </p>
    )}

    <div className="flex gap-3 flex-wrap justify-center mt-6">
      <button
        onClick={onReset}
        className="btn-primary"
        type="button"
      >
        Réessayer
      </button>
      <button
        onClick={() => window.location.assign('/')}
        className="btn-outline"
        type="button"
      >
        Retour à l'Accueil
      </button>
    </div>

    <div className="w-16 h-px bg-burgundy-200 mt-8 mx-auto" aria-hidden="true" />
  </div>
);
