import { Request, Response } from 'express';
import db from '../db.js';

export const createMaterialRequest = (req: Request, res: Response) => {
  const { project_id, contractor_id, material_type, quantity, priority } = req.body;
  const id = `req-${Date.now()}`;
  const stmt = db.prepare('INSERT INTO material_requests (id, project_id, contractor_id, material_type, quantity, priority, requested_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, project_id, contractor_id, material_type, quantity, priority, new Date().toISOString());
  res.json({ status: 'success', id });
};

export const getMaterialRequestsByProject = (req: Request, res: Response) => {
  const { projectId } = req.params;
  const requests = db.prepare('SELECT * FROM material_requests WHERE project_id = ?').all(projectId);
  res.json({ status: 'success', data: requests });
};

export const approveMaterialRequest = (req: Request, res: Response) => {
  const { id } = req.params;
  const request = db.prepare('SELECT * FROM material_requests WHERE id = ?').get(id);
  if (!request) return res.status(404).json({ status: 'error', message: 'Request not found' });

  db.prepare('UPDATE material_requests SET status = ? WHERE id = ?').run('APPROVED', id);

  // Auto-create material passport and delivery
  const passportId = `pass-${Date.now()}`;
  db.prepare('INSERT INTO material_passports (id, project_id, material_type, quantity, factory_name, truck_id, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    passportId, request.project_id, request.material_type, request.quantity, 'Default Factory', 'TRK-001', 'QR-CODE-DATA'
  );

  const deliveryId = `del-${Date.now()}`;
  db.prepare('INSERT INTO deliveries (id, passport_id, status) VALUES (?, ?, ?)').run(
    deliveryId, passportId, 'PENDING'
  );

  res.json({ status: 'success' });
};

export const rejectMaterialRequest = (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('UPDATE material_requests SET status = ? WHERE id = ?').run('REJECTED', id);
  res.json({ status: 'success' });
};
