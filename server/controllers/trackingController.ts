import { Request, Response } from 'express';
import db from '../db.js';

export const addTrackingData = (req: Request, res: Response) => {
  try {
    const { truck_id, latitude, longitude, timestamp } = req.body;
    const stmt = db.prepare('INSERT INTO truck_tracking (truck_id, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)');
    stmt.run(truck_id, latitude, longitude, timestamp);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to add tracking data' });
  }
};
