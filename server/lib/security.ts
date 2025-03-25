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

// Generate security token
export const generateSecurityToken = (req: Request, res: Response) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = req.ip || 'unknown';

    // Save token with session
    activeSessions[sessionId] = {
      token,
      isBlocked: false,
      timestamp: Date.now(),
      devToolsDetected: false
    };

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating security token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle dev tools detection
export const handleDevToolsDetection = (req: Request, res: Response) => {
  try {
    const { token, devToolsOpen } = req.body;
    const sessionId = req.ip || 'unknown';

    // Validate token
    if (!token || !activeSessions[sessionId] || activeSessions[sessionId].token !== token) {
      return res.status(403).json({ error: 'Security violation detected' });
    }

    // Update session status
    activeSessions[sessionId].devToolsDetected = !!devToolsOpen;
    activeSessions[sessionId].isBlocked = !!devToolsOpen;
    activeSessions[sessionId].timestamp = Date.now();

    // Log suspicious activity (in production this could trigger security alerts)
    console.warn(`DevTools detected for session ${sessionId}. Access restricted.`);

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

  // Check if session is blocked
  if (activeSessions[sessionId] && activeSessions[sessionId].isBlocked) {
    return res.status(403).json({ error: 'Access denied for security reasons' });
  }

  // Pass the connection state to the frontend
  res.setHeader('X-Security-Status', 'protected');

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