import { Request, Response } from 'express';
import db from '../db.js';

export const createDriver = (req: Request, res: Response) => {
  try {
    const { name, email, phone, truck_plate } = req.body;
    
    // In a real app, we would hash the password and create a user
    const id = `driver-${Date.now()}`;
    
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, role, password_hash)
      VALUES (?, ?, ?, 'DRIVER', 'hash')
    `);
    
    stmt.run(id, name, email);
    
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
