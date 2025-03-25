
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
