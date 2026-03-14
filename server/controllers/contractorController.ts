import { Request, Response } from 'express';
import db from '../db.js';

export const recalculateContractorScore = (contractorId: string) => {
  try {
    // 1. Get project stats
    const projects = db.prepare('SELECT status FROM projects WHERE contractor_id = ?').all(contractorId) as any[];
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

    // 2. Get delivery stats
    const deliveries = db.prepare(`
      SELECT d.status 
      FROM deliveries d
      JOIN projects p ON d.project_id = p.id
      WHERE p.contractor_id = ?
    `).all(contractorId) as any[];
    const totalDeliveries = deliveries.length;
    const successfulDeliveries = deliveries.filter(d => d.status === 'COMPLETED').length;

    // 3. Get reports stats
    const reports = db.prepare(`
      SELECT r.status 
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE p.contractor_id = ?
    `).all(contractorId) as any[];
    const totalReports = reports.length;
    const resolvedReports = reports.filter(r => r.status === 'RESOLVED').length;

    // Calculate metrics
    const deliveryAccuracy = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 100;
    const complaints = totalReports;
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 100;
    
    // Simple trust score formula
    // 40% delivery accuracy, 40% completion rate, -5% per unresolved complaint (max -20%)
    const unresolvedComplaints = totalReports - resolvedReports;
    const complaintPenalty = Math.min(unresolvedComplaints * 5, 20);
    
    const infraTrustScore = (deliveryAccuracy * 0.4) + (completionRate * 0.4) + (20 - complaintPenalty);

    // Update or Insert
    const upsert = db.prepare(`
      INSERT INTO contractor_scores (contractor_id, delivery_accuracy, complaints, durability, infra_trust_score)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(contractor_id) DO UPDATE SET
        delivery_accuracy = excluded.delivery_accuracy,
        complaints = excluded.complaints,
        infra_trust_score = excluded.infra_trust_score
    `);
    
    upsert.run(contractorId, deliveryAccuracy, complaints, 100, infraTrustScore);
    
    return infraTrustScore;
  } catch (error) {
    console.error('Error recalculating contractor score:', error);
    return null;
  }
};

export const getContractors = (req: Request, res: Response) => {
  try {
    const contractors = db.prepare(`
      SELECT u.id, u.name, u.email, s.delivery_accuracy, s.complaints, s.durability, s.infra_trust_score
      FROM users u
      LEFT JOIN contractor_scores s ON u.id = s.contractor_id
      WHERE u.role = 'CONTRACTOR'
    `).all();
    
    // Optionally trigger recalculation for all if needed, but let's just return for now
    res.json({ status: 'success', contractors });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contractors' });
  }
};

export const getUsersByRole = (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, name, email, role FROM users';
    let params: any[] = [];
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    const users = db.prepare(query).all(...params);
    res.json({ status: 'success', data: { users } });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
};
