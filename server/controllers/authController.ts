import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'infratrust-demo-secret';

const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  state: user.state,
  district: user.district,
  city: user.city,
  pincode: user.pincode,
  latitude: user.latitude,
  longitude: user.longitude,
});

export const login = async (req: Request, res: Response) => {
  try {
    const { role, identifier, password, truckPlate } = req.body;

    if (!role || !identifier || !password) {
      return res.status(400).json({ status: 'error', message: 'Role, identifier, and password are required' });
    }

    const user = db.prepare(`
      SELECT u.*, dp.truck_plate
      FROM users u
      LEFT JOIN driver_profiles dp ON dp.user_id = u.id
      WHERE u.role = ? AND (LOWER(u.email) = LOWER(?) OR u.phone = ?)
    `).get(role, identifier, identifier) as any;

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    if (role === 'DRIVER' && truckPlate && user.truck_plate && user.truck_plate !== truckPlate) {
      return res.status(401).json({ status: 'error', message: 'Truck number does not match driver profile' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ status: 'success', user: sanitizeUser(user), token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Authentication failed' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, state, district, city, pincode, latitude, longitude } = req.body;

    if (role !== 'CITIZEN') {
      return res.status(403).json({ status: 'error', message: 'Only citizens can self-register' });
    }

    if (!name || !email || !phone || !password || !state || !district || !city) {
      return res.status(400).json({ status: 'error', message: 'Missing required registration fields' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR phone = ?').get(email, phone);
    if (existingUser) {
      return res.status(409).json({ status: 'error', message: 'Account already exists' });
    }

    const id = `citizen-${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (
        id, name, email, phone, role, password_hash, state, district, city, pincode, latitude, longitude
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      email,
      phone,
      'CITIZEN',
      passwordHash,
      state,
      district,
      city,
      pincode || null,
      latitude ?? null,
      longitude ?? null,
    );

    res.status(201).json({ status: 'success', message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: 'Registration failed' });
  }
};

export const me = (req: Request, res: Response) => {
  res.json({ status: 'success', user: req.user });
};
