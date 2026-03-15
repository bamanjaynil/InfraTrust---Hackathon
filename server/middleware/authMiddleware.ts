import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import db from '../db.js';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'infratrust-demo-secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.prepare(`
      SELECT id, name, email, phone, role, state, district, city, pincode, latitude, longitude
      FROM users
      WHERE id = ?
    `).get(payload.userId);

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
  }

  next();
};
