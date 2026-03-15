import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';

export const createDriver = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, truck_plate } = req.body;
    if (!name || !email || !phone || !truck_plate) {
      return res.status(400).json({ status: 'error', message: 'name, email, phone, and truck_plate are required' });
    }

    const id = `driver-${Date.now()}`;
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, phone, role, password_hash)
      VALUES (?, ?, ?, ?, 'DRIVER', ?)
    `);
    
    stmt.run(id, name, email, phone, passwordHash);
    
    const profileStmt = db.prepare(`
      INSERT INTO driver_profiles (id, user_id, phone, truck_plate)
      VALUES (?, ?, ?, ?)
    `);
    const profileId = `dp-${Date.now()}`;
    profileStmt.run(profileId, id, phone, truck_plate);
    
    const newDriver = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, dp.phone, dp.truck_plate 
      FROM users u 
      LEFT JOIN driver_profiles dp ON u.id = dp.user_id 
      WHERE u.id = ?
    `).get(id);
    res.status(201).json({ status: 'success', data: newDriver });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create driver' });
  }
};

export const getDrivers = (req: Request, res: Response) => {
  try {
    const drivers = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, dp.phone, dp.truck_plate 
      FROM users u 
      LEFT JOIN driver_profiles dp ON u.id = dp.user_id 
      WHERE u.role = 'DRIVER'
    `).all();

    res.json({ status: 'success', data: drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch drivers' });
  }
};
