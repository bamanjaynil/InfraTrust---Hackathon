import { Request, Response } from 'express';
import db from '../db.js';
import * as passportService from '../services/passportService.js';

export const createMaterialRequest = (req: Request, res: Response) => {
  try {
    const { project_id, material_type, quantity, requested_date } = req.body;
    const contractor_id = req.user?.id;

    if (!contractor_id) {
      return res.status(400).json({ status: 'error', message: 'Contractor ID is required' });
    }

    const id = `req-${Date.now()}`;
    
    const stmt = db.prepare(`
      INSERT INTO material_requests (id, project_id, contractor_id, material_type, quantity, requested_date, status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
    `);
    
    stmt.run(id, project_id, contractor_id, material_type, quantity, requested_date);
    
    const newRequest = db.prepare('SELECT * FROM material_requests WHERE id = ?').get(id);
    res.status(201).json({ status: 'success', data: newRequest });
  } catch (error) {
    console.error('Error creating material request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create material request' });
  }
};

export const approveMaterialRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = db.prepare('SELECT * FROM material_requests WHERE id = ?').get(id);
    if (!request) return res.status(404).json({ status: 'error', message: 'Request not found' });

    db.prepare('UPDATE material_requests SET status = ? WHERE id = ?').run('APPROVED', id);

    // Auto-create material passport
    const passport = await passportService.createPassport({
      project_id: request.project_id,
      material_type: request.material_type,
      quantity: request.quantity,
      factory_name: 'Default Factory',
      truck_id: 'TRK-001'
    });

    // Auto-create delivery record connected to passport
    const deliveryId = `del-${Date.now()}`;
    db.prepare('INSERT INTO deliveries (id, passport_id, project_id, contractor_id, truck_number, material_type, volume, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      deliveryId, passport.id, request.project_id, request.contractor_id, 'TRK-001', request.material_type, request.quantity, 'PENDING'
    );

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error approving material request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to approve request' });
  }
};

export const rejectMaterialRequest = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE material_requests SET status = ? WHERE id = ?').run('REJECTED', id);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error rejecting material request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to reject request' });
  }
};

export const getMaterialRequestsByProject = (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const requests = db.prepare('SELECT * FROM material_requests WHERE project_id = ?').all(projectId);
    res.json({ status: 'success', data: requests });
  } catch (error) {
    console.error('Error fetching material requests:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch material requests' });
  }
};

export const getMaterialRequestsByContractor = (req: Request, res: Response) => {
  try {
    const contractor_id = req.user?.id;

    if (!contractor_id) {
      return res.status(400).json({ status: 'error', message: 'Contractor ID is required' });
    }

    const requests = db.prepare(`
      SELECT mr.*, p.name as project_name 
      FROM material_requests mr
      LEFT JOIN projects p ON mr.project_id = p.id
      WHERE mr.contractor_id = ?
      ORDER BY mr.created_at DESC
    `).all(contractor_id);

    res.json({ status: 'success', data: requests });
  } catch (error) {
    console.error('Error fetching material requests:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch material requests' });
  }
};

export const updateMaterialRequestStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Status is required"
      });
    }

    const request = db
      .prepare("SELECT * FROM material_requests WHERE id = ?")
      .get(id);

    if (!request) {
      return res.status(404).json({
        status: "error",
        message: "Material request not found"
      });
    }

    db.prepare(
      "UPDATE material_requests SET status = ? WHERE id = ?"
    ).run(status, id);

    res.json({
      status: "success",
      message: "Material request status updated"
    });

  } catch (error) {
    console.error("Error updating request status:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to update material request"
    });
  }
};
