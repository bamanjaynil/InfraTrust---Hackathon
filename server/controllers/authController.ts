import { Request, Response } from 'express';
import db from '../db.js';

export const login = (req: Request, res: Response) => {
  try {
    const { role, identifier, password } = req.body;
    
    let user = db.prepare('SELECT * FROM users WHERE role = ? AND (email = ? OR id = ?)').get(role, identifier, identifier);
    
    if (!user) {
      // For testing purposes, if user not found, return a mock user
      user = { id: `${role.toLowerCase()}-1`, name: `Test ${role}`, email: identifier, role };
    }

    if (password.length < 4) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    res.json({ status: 'success', user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Authentication failed' });
  }
};

export const register = (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    if (role !== 'CITIZEN') {
      return res.status(403).json({ status: 'error', message: 'Only citizens can register' });
    }
    
    const id = `citizen-${Date.now()}`;
    const insert = db.prepare('INSERT INTO users (id, name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)');
    insert.run(id, name, email, role, 'hashed_password');
    
    res.status(201).json({ status: 'success', message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ status: 'error', message: 'Email already exists or invalid data' });
  }
};
