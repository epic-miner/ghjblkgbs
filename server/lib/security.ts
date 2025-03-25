import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// In-memory store for blocking specific clients
// In production, use Redis or a shared database
const blockedClients = new Map<string, number>();
const clientTokens = new Map<string, string>();

// Generate a security token for a client session
export const generateClientToken = (clientId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  clientTokens.set(clientId, token);
  return token;
};

// Validate that a client's token is legitimate
export const validateClientToken = (clientId: string, token: string): boolean => {
  const validToken = clientTokens.get(clientId);
  return validToken === token;
};

// Get client identifier from request
export const getClientId = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Create a composite ID
  return crypto.createHash('sha256')
    .update(`${ip}-${userAgent}`)
    .digest('hex');
};

// Block a client from receiving further data
export const blockClient = (clientId: string, duration: number = 3600000): void => {
  // Default duration: 1 hour
  blockedClients.set(clientId, Date.now() + duration);
};

// Check if a client is blocked
export const isClientBlocked = (clientId: string): boolean => {
  const expiryTime = blockedClients.get(clientId);

  if (!expiryTime) {
    return false;
  }

  // Check if block has expired
  if (Date.now() > expiryTime) {
    blockedClients.delete(clientId);
    return false;
  }

  return true;
};

// Security middleware to check client status
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientId = getClientId(req);

  // Skip security check for security endpoints
  if (req.path.startsWith('/api/security')) {
    return next();
  }

  // Check if client is blocked
  if (isClientBlocked(clientId)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your session has been terminated for security reasons.'
    });
  }

  next();
};

const disableConsole = () => {
  const noop = () => undefined;
  const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'profile', 'profileEnd'];

  // Save original console methods for our own use
  const originalConsole = {
    warn: console.warn,
    error: console.error
  };

  // Override all console methods
  methods.forEach(method => {
    console[method] = noop;
  });

  // Add warning for console access with browser detection
  const showWarning = () => {
    // Detect if using Chromium-based browser
    const isChromium = () => {
      // @ts-ignore
      return !!window.chrome || /Chrome/.test(navigator.userAgent);
    };

    // @ts-ignore
    const isEdge = /Edg/.test(navigator.userAgent);

    let browserWarning = '';
    if (isChromium()) {
      browserWarning = isEdge ? 'Edge' : 'Chrome';
    }

    originalConsole.warn(
      '%cStop!', 
      'color: red; font-size: 30px; font-weight: bold;'
    );
    originalConsole.warn(
      `%cThis is a security feature of our video player. ${browserWarning ? `${browserWarning} ` : ''}Console access is restricted.`,
      'color: red; font-size: 16px;'
    );
    originalConsole.warn(
      '%cAttempting to bypass security measures is prohibited.',
      'color: red; font-size: 16px;'
    );
  };

  // Periodically clear console and show warning
  setInterval(() => {
    console.clear();
    showWarning();
  }, 100);

  // Additional protection for Chromium browsers
  try {
    // Prevent console.log overrides
    Object.defineProperty(console, '_commandLineAPI', {
      get: function() {
        showWarning();
        throw new Error('Console API access denied');
      }
    });

    // Chromium specific protection
    const originalDesc = Object.getOwnPropertyDescriptor(window, 'console');
    if (originalDesc) {
      Object.defineProperty(window, 'console', {
        get: function() {
          return {
            log: noop,
            debug: noop,
            info: noop,
            warn: noop,
            error: noop,
            table: noop,
            trace: noop,
            time: noop,
            timeEnd: noop,
            profile: noop,
            profileEnd: noop,
            clear: noop
          };
        },
        set: function() {
          return false;
        },
        configurable: false
      });
    }
  } catch (e) {
    // Silent fail for unsupported browsers
  }
};

export const preventKeyboardShortcuts = () => {
  // Use capture phase to intercept events before they reach other handlers
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Prevent F12
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Prevent ALL dev tools keyboard shortcuts
    if (e.ctrlKey && e.shiftKey && (
        e.key === 'I' || e.key === 'i' || // Chrome, Firefox, Edge Inspector
        e.key === 'J' || e.key === 'j' || // Chrome Console
        e.key === 'C' || e.key === 'c' || // Chrome Elements
        e.key === 'K' || e.key === 'k' || // Chrome Network
        e.key === 'M' || e.key === 'm'    // Chrome Developer Tools (general)
      )) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Prevent Safari dev tools (Cmd+Opt+I)
    if ((e.metaKey || e.ctrlKey) && e.altKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
};