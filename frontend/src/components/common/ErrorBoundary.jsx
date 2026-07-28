import { Component } from 'react';
import logger from '../../utils/logger';

/**
 * HAFROSE Enterprise Error Boundary (Phase 5.5)
 * Catches unexpected React rendering errors and displays a graceful fallback.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an unhandled exception', {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="min-h-[400px] flex flex-col items-center justify-center gap-6 p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl">
            ⚠
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Une erreur inattendue s'est produite
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md text-sm">
              Nous nous excusons pour la gêne occasionnée. Nos équipes techniques ont été notifiées.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
