import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error + performance monitoring.
 *
 * Safe by design:
 *  - Only runs in a production build (import.meta.env.PROD).
 *  - No-ops if VITE_SENTRY_DSN is not set, so a missing key never breaks the app.
 *
 * Set VITE_SENTRY_DSN in your hosting/build environment (see .env.example).
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Don't send events from local dev, and don't crash if the DSN is unset.
  if (!import.meta.env.PROD || !dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Tag events with the build so you can tell which release an error came from.
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,

    integrations: [
      Sentry.browserTracingIntegration(),
      // Session Replay: record only when an error happens (cheap, very useful for debugging).
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],

    // Performance tracing: sample 10% of transactions. Tune up/down later.
    tracesSampleRate: 0.1,

    // Replay sampling: 0% of normal sessions, 100% of sessions with an error.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // Filter out noise from browser extensions and known non-actionable errors.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Could not establish connection. Receiving end does not exist',
      'No Listener: tabs:outgoing.message.ready',
      'Non-Error promise rejection captured',
    ],

    // Drop events that originate from browser-extension scripts.
    denyUrls: [/extensions\//i, /^chrome-extension:\/\//i, /^moz-extension:\/\//i],
  });
}

export { Sentry };
