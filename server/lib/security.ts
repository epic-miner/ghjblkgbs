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


// Track session request patterns to detect scrapers
const sessionPatterns = {};
const MAX_REQUESTS_PER_MINUTE = 120; // Set appropriate threshold for your app
const SUSPICIOUS_PATTERN_SCORE_THRESHOLD = 70;

// Middleware to detect scraping patterns
export const scraperDetectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.ip || 'unknown';
  const now = Date.now();
  const path = req.path;
  const method = req.method;
  const userAgent = req.headers['user-agent'] || '';
  
  // Initialize session tracking if needed
  if (!sessionPatterns[sessionId]) {
    sessionPatterns[sessionId] = {
      requestTimes: [],
      pathsAccessed: new Set(),
      methodsUsed: new Set(),
      lastUserAgent: userAgent,
      suspiciousScore: 0
    };
  }
  
  const pattern = sessionPatterns[sessionId];
  
  // Update tracking data
  pattern.requestTimes.push(now);
  pattern.pathsAccessed.add(path);
  pattern.methodsUsed.add(method);
  
  // Limit the history we track
  if (pattern.requestTimes.length > 500) {
    pattern.requestTimes.shift();
  }
  
  // Calculate request rate (requests per minute)
  const recentRequests = pattern.requestTimes.filter(t => t > now - 60000);
  const requestRate = recentRequests.length;
  
  // Check for suspicious patterns
  let suspiciousScore = 0;
  
  // 1. High request rate
  if (requestRate > MAX_REQUESTS_PER_MINUTE) {
    suspiciousScore += 30;
  }
  
  // 2. Accessing many different endpoints rapidly
  if (pattern.pathsAccessed.size > 15 && requestRate > 50) {
    suspiciousScore += 20;
  }
  
  // 3. Changing user agent
  if (pattern.lastUserAgent && pattern.lastUserAgent !== userAgent) {
    suspiciousScore += 10;
  }
  pattern.lastUserAgent = userAgent;
  
  // 4. Unusual request pattern (e.g., accessing resources in systematic order)
  if (pattern.requestTimes.length > 4) {
    const intervals = [];
    for (let i = 1; i < recentRequests.length; i++) {
      intervals.push(recentRequests[i] - recentRequests[i-1]);
    }
    
    // Check if intervals are suspiciously consistent (automated behavior)
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const consistentIntervals = intervals.filter(i => Math.abs(i - avgInterval) < 50).length;
    
    if (consistentIntervals / intervals.length > 0.7) {
      suspiciousScore += 20;
    }
  }
  
  // Update the suspicious score
  pattern.suspiciousScore = suspiciousScore;
  
  // If score exceeds threshold, block the session
  if (suspiciousScore > SUSPICIOUS_PATTERN_SCORE_THRESHOLD) {
    console.warn(`Blocking suspicious scraping pattern from ${sessionId}. Score: ${suspiciousScore}`);
    
    // Mark session as blocked in active sessions
    if (activeSessions[sessionId]) {
      activeSessions[sessionId].isBlocked = true;
      activeSessions[sessionId].timestamp = now; // Reset timestamp for block duration
    } else {
      activeSessions[sessionId] = {
        isBlocked: true,
        timestamp: now,
        devToolsDetected: false,
        requestCount: 1,
        lastRequestTime: now
      };
    }
    
    return res.status(403).json({ error: 'Suspicious request pattern detected' });
  }
  
  next();
};

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
  const userAgent = req.headers['user-agent'] || '';
  
  // Block common scraping tools and CLI utilities by user agent
  const blockedAgents = [
    'wget', 'curl', 'aria2', 'python-requests', 'beautifulsoup', 
    'scrapy', 'httrack', 'webhttrack', 'phantomjs', 'selenium',
    'puppeteer', 'playwright', 'nightmare'
  ];
  
  if (blockedAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    console.warn(`Blocked scraping attempt from ${sessionId} using: ${userAgent}`);
    return res.status(403).json({ error: 'Automated tools and scrapers are not permitted' });
  }
  
  // Check for missing or suspicious headers that are typically present in browsers
  const hasAcceptHeader = req.headers['accept'];
  const hasAcceptLanguage = req.headers['accept-language'];
  
  if (!hasAcceptHeader || !hasAcceptLanguage) {
    // Most browsers send these headers, so missing them is suspicious
    console.warn(`Suspicious request missing standard headers from ${sessionId}`);
    return res.status(403).json({ error: 'Invalid request format' });
  }
  
  // Check request rate for this session (basic rate limiting)
  const now = Date.now();
  if (!activeSessions[sessionId]) {
    activeSessions[sessionId] = { 
      timestamp: now, 
      isBlocked: false, 
      devToolsDetected: false,
      requestCount: 1,
      lastRequestTime: now
    };
  } else {
    // Update request count and check for too many requests
    const session = activeSessions[sessionId];
    
    // Only check if the session is already flagged as blocked
    if (session.isBlocked) {
      // Add a check to ensure we're not permanently blocking users
      // If block has been in place for more than 10 minutes, lift it
      const blockDuration = now - session.timestamp;
      if (blockDuration > 10 * 60 * 1000) { // 10 minutes
        console.log(`Temporary block for session ${sessionId} has expired and is being lifted.`);
        session.isBlocked = false;
        session.devToolsDetected = false;
      } else {
        return res.status(403).json({ error: 'Access denied for security reasons' });
      }
    }
    
    // Update request stats
    session.requestCount++;
    session.lastRequestTime = now;
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