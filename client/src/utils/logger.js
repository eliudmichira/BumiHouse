/**
 * Production-safe logger utility
 * Automatically gates console statements based on environment
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors, but with less detail in production
    if (isDev) {
      console.error(...args);
    } else {
      // In production, log minimal error info
      const errorInfo = args.map(arg => {
        if (arg instanceof Error) {
          return { message: arg.message, name: arg.name };
        }
        return typeof arg === 'object' ? JSON.stringify(arg).substring(0, 200) : arg;
      });
      console.error(...errorInfo);
    }
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  }
};
