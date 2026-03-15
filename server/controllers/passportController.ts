import { Request, Response } from 'express';
import db from '../db.js';
import * as passportService from '../services/passportService.js';

export const createPassport = async (req: Request, res: Response) => {
  try {
    const passport = await passportService.createPassport(req.body);
    const project = db.prepare('SELECT contractor_id FROM projects WHERE id = ?').get(req.body.project_id) as any;
    const deliveryId = `delivery-${Date.now()}`;
    db.prepare(`
      INSERT INTO deliveries (id, passport_id, project_id, contractor_id, driver_id, truck_number, material_type, volume, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ASSIGNED')
    `).run(
      deliveryId,
      passport.id,
      req.body.project_id,
      project?.contractor_id || null,
      req.body.driver_id || null,
      req.body.truck_number,
      req.body.material_type,
      req.body.quantity,
    );
    db.prepare('UPDATE material_passports SET delivery_id = ? WHERE id = ?').run(deliveryId, passport.id);
    res.status(201).json({ status: 'success', data: { ...passport, delivery_id: deliveryId } });
  } catch (error) {
    console.error('Error creating passport:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create passport' });
  }
};

export const verifyPassport = async (req: Request, res: Response) => {
  try {
    const result = await passportService.verifyPassport(req.body.passport_id);
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error('Error verifying passport:', error);
    res.status(400).json({ status: 'error', message: 'Failed to verify passport' });
  }
};

export const getProjectPassports = (req: Request, res: Response) => {
  try {
    const passports = db.prepare(`
      SELECT mp.*, u.name AS driver_name
      FROM material_passports mp
      LEFT JOIN users u ON u.id = mp.driver_id
      WHERE mp.project_id = ?
      ORDER BY mp.created_at DESC
    `).all(req.params.id);
    res.json({ status: 'success', data: passports });
  } catch (error) {
    console.error('Error fetching project passports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch passports' });
  }
};
