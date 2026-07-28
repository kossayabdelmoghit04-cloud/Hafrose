/**
 * HAFROSE — Structured Production Logger (Phase 5.5)
 *
 * In development: human-readable console output
 * In production:  silent debug/info, warns/errors remain + hook for remote telemetry
 */

const IS_DEV = import.meta.env.DEV;

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LEVEL = IS_DEV ? LEVELS.DEBUG : LEVELS.WARN;

function formatMessage(level, message, context = {}) {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    app: 'HAFROSE',
    env: IS_DEV ? 'development' : 'production',
  };
}

/**
 * Remote telemetry hook — Replace with your real APM (Sentry, Datadog, etc.)
 */
function sendToRemote(payload) {
  // Example: window.__TELEMETRY_QUEUE?.push(payload);
  // In production, integrate with your monitoring service here.
  if (!IS_DEV && typeof window !== 'undefined') {
    // Passive — does not block the UI thread
    try {
      const existing = JSON.parse(sessionStorage.getItem('__hafrose_errors') || '[]');
      existing.push(payload);
      sessionStorage.setItem('__hafrose_errors', JSON.stringify(existing.slice(-20)));
    } catch {
      // Storage quota or parse error — safe to ignore
    }
  }
}

const logger = {
  debug(message, context = {}) {
    if (CURRENT_LEVEL > LEVELS.DEBUG) return;
    console.debug(`[HAFROSE DEBUG]`, message, context);
  },

  info(message, context = {}) {
    if (CURRENT_LEVEL > LEVELS.INFO) return;
    console.info(`[HAFROSE INFO]`, message, context);
  },

  warn(message, context = {}) {
    if (CURRENT_LEVEL > LEVELS.WARN) return;
    const payload = formatMessage('WARN', message, context);
    console.warn(`[HAFROSE WARN]`, message, context);
    sendToRemote(payload);
  },

  error(message, context = {}) {
    const payload = formatMessage('ERROR', message, context);
    console.error(`[HAFROSE ERROR]`, message, context);
    sendToRemote(payload);
  },
};

export default logger;
