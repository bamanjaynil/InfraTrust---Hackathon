import { Request, Response } from 'express';
import db from '../db.js';

export const addTrackingData = (req: Request, res: Response) => {
  try {
    const { truck_id, latitude, longitude, timestamp } = req.body;
    db.prepare(`
      INSERT INTO truck_tracking (truck_id, latitude, longitude, timestamp)
      VALUES (?, ?, ?, ?)
    `).run(truck_id, latitude, longitude, timestamp || new Date().toISOString());
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error adding tracking data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add tracking data' });
  }
};

export const getTracking = (req: Request, res: Response) => {
  try {
    const { truck_id } = req.query;
    const data = truck_id
      ? db.prepare('SELECT * FROM truck_tracking WHERE truck_id = ? ORDER BY timestamp DESC').all(truck_id)
      : db.prepare('SELECT * FROM truck_tracking ORDER BY timestamp DESC').all();
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch tracking data' });
  }
};
