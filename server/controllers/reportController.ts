import { Request, Response } from 'express';
import db from '../db.js';
import { createReport, getReportsByUserId, getAllReports } from '../models/reportModel.js';
import { recalculateContractorScore } from './contractorController.js';

export const submitReport = (req: Request, res: Response) => {
  try {
    const { project_id, description, photo, latitude, longitude } = req.body;
    
    // Mock auth token parsing
    const authHeader = req.headers.authorization;
    let userId = 'citizen-1'; 
    if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
      userId = authHeader.split('-')[3];
    }

    const id = `rep-${Date.now()}`;
    
    const report = createReport({
      id,
      user_id: userId,
      project_id: project_id || null,
      description,
      photo_url: photo || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status: 'OPEN'
    });

    res.status(201).json({ status: 'success', data: report });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit report' });
  }
};

export const getMyReports = (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'citizen-1'; 
    if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
      userId = authHeader.split('-')[3];
    }

    const reports = getReportsByUserId(userId);
    res.status(200).json({ status: 'success', reports });
  } catch (error) {
    console.error('Error fetching my reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
};

export const getReports = (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    
    let query = 'SELECT * FROM reports WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (description LIKE ? OR id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const reports = db.prepare(query).all(...params);
    res.status(200).json({ status: 'success', reports });
  } catch (error) {
    console.error('Error fetching all reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
};

export const getReportsByProject = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const reports = db.prepare(`
      SELECT r.*, p.name as project_name 
      FROM reports r
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE r.project_id = ?
      ORDER BY r.created_at DESC
    `).all(id);
    
    res.json({ status: 'success', data: reports });
  } catch (error) {
    console.error('Error fetching project reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch project reports' });
  }
};

export const getReportsByContractor = (req: Request, res: Response) => {
  try {
    const contractor_id = req.user?.id;
    if (!contractor_id) {
      return res.status(400).json({ status: 'error', message: 'Contractor ID is required' });
    }
    
    const reports = db.prepare(`
      SELECT r.*, p.name as project_name 
      FROM reports r
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE p.contractor_id = ?
      ORDER BY r.created_at DESC
    `).all(contractor_id);
    
    res.json({ status: 'success', data: reports });
  } catch (error) {
    console.error('Error fetching contractor reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contractor reports' });
  }
};

export const updateReportStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, id);
    
    // If status changed to RESOLVED, recalculate contractor score
    if (status === 'RESOLVED') {
      const report = db.prepare(`
        SELECT p.contractor_id 
        FROM reports r
        JOIN projects p ON r.project_id = p.id
        WHERE r.id = ?
      `).get(id) as any;
      
      if (report && report.contractor_id) {
        recalculateContractorScore(report.contractor_id);
      }
    }

    res.status(200).json({ status: 'success', message: 'Report status updated' });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update report status' });
  }
};
