import { Request, Response, NextFunction } from 'express';
import db from '../db.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }

  try {
    // In a real app, verify JWT token here
    // For this mock implementation, extract user ID from token
    // Token format: mock-jwt-token-{userId}-{timestamp}
    const parts = token.split('-');
    
    if (parts.length >= 4 && parts[0] === 'mock' && parts[1] === 'jwt' && parts[2] === 'token') {
      // Extract userId which might contain hyphens (e.g. contractor-1)
      const userIdParts = parts.slice(3, parts.length - 1);
      const userId = userIdParts.join('-');
      
      const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);
      
      if (user) {
        req.user = user;
        return next();
      }
    }
    
    return res.status(403).json({ status: 'error', message: 'Invalid token' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ status: 'error', message: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
    }

    next();
  };
};
