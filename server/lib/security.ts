import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Store active sessions and their security status
const activeSessions: Record<string, {
  token: string,
  isBlocked: boolean,
  timestamp: number,
  devToolsDetected: boolean
}> = {};

// Clean up old sessions every 15 minutes
setInterval(() => {
  const now = Date.now();
  const sessionTimeout = 1000 * 60 * 30; // 30 minutes

  Object.keys(activeSessions).forEach(sessionId => {
    if (now - activeSessions[sessionId].timestamp > sessionTimeout) {
      delete activeSessions[sessionId];
    }
  });
}, 1000 * 60 * 15);

// Track session request patterns to detect scrapers
const sessionPatterns: Record<string, {
  requestCount: number,
  lastRequest: number,
  userAgent?: string
}> = {};

const MAX_REQUESTS_PER_MINUTE = 120; // Set appropriate threshold for your app

// Generate security token
export const generateSecurityToken = (req: Request, res: Response) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = req.ip || 'unknown';

    activeSessions[sessionId] = {
      token,
      isBlocked: false,
      timestamp: Date.now(),
      devToolsDetected: false
    };

    return res.json({ token });
  } catch (error) {
    console.error('Error generating security token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle dev tools detection from client
export const handleDevToolsDetection = (req: Request, res: Response) => {
  try {
    const { devToolsOpen, token, timestamp } = req.body;
    const sessionId = req.ip || 'unknown';

    // Validate session token
    if (!activeSessions[sessionId] || activeSessions[sessionId].token !== token) {
      return res.status(403).json({ error: 'Invalid security token' });
    }

    // Mark session as having dev tools open
    activeSessions[sessionId].devToolsDetected = devToolsOpen;
    activeSessions[sessionId].isBlocked = true;
    activeSessions[sessionId].timestamp = timestamp || Date.now();

    // Log suspicious activity (in production this could trigger security alerts)
    console.warn(`DevTools detected for session ${sessionId}. Access restricted.`);

    // Set a timeout to automatically clear block after 5 minutes
    // This helps with false positives
    setTimeout(() => {
      if (activeSessions[sessionId]) {
        activeSessions[sessionId].isBlocked = false;
        activeSessions[sessionId].devToolsDetected = false;
        console.log(`Temporary block for session ${sessionId} has been lifted.`);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return res.status(403).json({ error: 'Security violation detected' });
  } catch (error) {
    console.error('Error handling dev tools detection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Security middleware to check all protected routes
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip security checks for security endpoints themselves
  if (req.path.startsWith('/api/security')) {
    return next();
  }

  const sessionId = req.ip || 'unknown';

  // Check if this session is blocked due to detected security issues
  if (activeSessions[sessionId] && activeSessions[sessionId].isBlocked) {
    return res.status(403).json({ error: 'Access denied for security reasons' });
  }

  // Track request patterns to detect scraping or automation tools
  if (!sessionPatterns[sessionId]) {
    sessionPatterns[sessionId] = {
      requestCount: 1,
      lastRequest: Date.now(),
      userAgent: req.headers['user-agent']
    };
  } else {
    const now = Date.now();
    const timeSinceLastRequest = now - sessionPatterns[sessionId].lastRequest;

    // If within the same minute, increment counter
    if (timeSinceLastRequest < 60000) {
      sessionPatterns[sessionId].requestCount++;

      // Check for rate limiting
      if (sessionPatterns[sessionId].requestCount > MAX_REQUESTS_PER_MINUTE) {
        activeSessions[sessionId] = {
          token: '',
          isBlocked: true,
          timestamp: Date.now(),
          devToolsDetected: false
        };

        console.warn(`Rate limit exceeded for session ${sessionId}. Potential scraping detected.`);
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
    } else {
      // Reset counter for new minute
      sessionPatterns[sessionId].requestCount = 1;
    }

    sessionPatterns[sessionId].lastRequest = now;
  }

  // Check for suspicious user agents (common scraping tools)
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const suspiciousAgents = ['wget', 'curl', 'python-requests', 'scrapy', 'beautifulsoup', 'aria2', 'httrack'];

  if (suspiciousAgents.some(agent => userAgent.includes(agent))) {
    activeSessions[sessionId] = {
      token: '',
      isBlocked: true,
      timestamp: Date.now(),
      devToolsDetected: false
    };

    console.warn(`Suspicious user agent detected: ${userAgent}`);
    return res.status(403).json({ error: 'Access denied for security reasons' });
  }

  // Check for missing headers that browsers typically send
  if (!req.headers['accept-language'] || !req.headers['accept']) {
    // This may indicate a script rather than a browser
    console.warn(`Request missing standard headers from ${sessionId}`);
    // We could block here, but just logging for now to avoid false positives
  }

  next();
};

// Extended security scan middleware (for sensitive routes)
export const enhancedSecurityScan = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.ip || 'unknown';
  const token = req.headers['x-security-token'] || req.query.token;

  // Validate session token for sensitive routes
  if (!token || !activeSessions[sessionId] || activeSessions[sessionId].token !== token) {
    return res.status(403).json({ error: 'Enhanced security check failed' });
  }

  // Update session timestamp
  activeSessions[sessionId].timestamp = Date.now();

  next();
};

// Get session security status (for internal use)
export const getSessionStatus = (sessionId: string) => {
  return activeSessions[sessionId] || { isBlocked: false, devToolsDetected: false };
};

// Block specific session
export const blockSession = (sessionId: string) => {
  if (activeSessions[sessionId]) {
    activeSessions[sessionId].isBlocked = true;
    return true;
  }
  return false;
};