import { Request, Response } from 'express';
import db from '../db.js';
import { recalculateContractorScore } from './contractorController.js';

export const submitReport = (req: Request, res: Response) => {
  try {
    const { project_id, description, photo, latitude, longitude } = req.body;
    const userId = req.user?.id || 'citizen-1';
    const id = `report-${Date.now()}`;

    db.prepare(`
      INSERT INTO reports (id, user_id, project_id, description, photo_url, latitude, longitude, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')
    `).run(id, userId, project_id || null, description, photo || null, latitude, longitude);

    res.status(201).json({ status: 'success', data: { id } });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit report' });
  }
};

export const getMyReports = (req: Request, res: Response) => {
  try {
    const reports = db.prepare('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC').all(req.user?.id || 'citizen-1');
    res.json({ status: 'success', reports });
  } catch (error) {
    console.error('Error fetching my reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
};

export const getReports = (req: Request, res: Response) => {
  try {
    const { search = '', status = '' } = req.query as any;
    const reports = db.prepare(`
      SELECT r.*, u.name AS reporter_name, p.name AS project_name
      FROM reports r
      JOIN users u ON u.id = r.user_id
      LEFT JOIN projects p ON p.id = r.project_id
      WHERE (? = '' OR r.status = ?)
        AND (? = '' OR r.description LIKE ? OR COALESCE(p.name, '') LIKE ?)
      ORDER BY r.created_at DESC
    `).all(status, status, search, `%${search}%`, `%${search}%`);
    res.json({ status: 'success', reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
};

export const getReportsByProject = (req: Request, res: Response) => {
  try {
    const reports = db.prepare(`
      SELECT r.*, u.name AS reporter_name
      FROM reports r
      JOIN users u ON u.id = r.user_id
      WHERE r.project_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.id);
    res.json({ status: 'success', data: reports });
  } catch (error) {
    console.error('Error fetching project reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch project reports' });
  }
};

export const getReportsByContractor = (req: Request, res: Response) => {
  try {
    const reports = db.prepare(`
      SELECT r.*, p.name AS project_name, u.name AS reporter_name
      FROM reports r
      JOIN projects p ON p.id = r.project_id
      JOIN users u ON u.id = r.user_id
      WHERE p.contractor_id = ?
      ORDER BY r.created_at DESC
    `).all(req.user.id);
    res.json({ status: 'success', data: reports });
  } catch (error) {
    console.error('Error fetching contractor reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contractor reports' });
  }
};

export const updateReportStatus = (req: Request, res: Response) => {
  try {
    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    const report = db.prepare(`
      SELECT p.contractor_id
      FROM reports r
      LEFT JOIN projects p ON p.id = r.project_id
      WHERE r.id = ?
    `).get(req.params.id) as any;
    if (report?.contractor_id) {
      recalculateContractorScore(report.contractor_id);
    }
    res.json({ status: 'success', message: 'Report status updated' });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update report status' });
  }
};
