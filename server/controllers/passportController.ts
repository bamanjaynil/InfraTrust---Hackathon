import { Request, Response } from 'express';
import * as passportService from '../services/passportService.js';
import db from '../db.js';

export const createPassport = async (req: Request, res: Response) => {
  try {
    const passport = await passportService.createPassport(req.body);
    res.json({ status: 'success', data: passport });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create passport' });
  }
};

export const verifyPassport = async (req: Request, res: Response) => {
  try {
    const { passport_id, arrival_lat, arrival_lng, arrival_time } = req.body;
    const result = await passportService.verifyPassport(passport_id, arrival_lat, arrival_lng, arrival_time);
    res.json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to verify passport' });
  }
};

export const getProjectPassports = (req: Request, res: Response) => {
  const { id } = req.params;
  const passports = db.prepare('SELECT * FROM material_passports WHERE project_id = ?').all(id);
  res.json({ status: 'success', data: passports });
};
