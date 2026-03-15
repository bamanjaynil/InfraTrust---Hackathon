import { Request, Response } from 'express';
import db from '../db.js';

export const recalculateContractorScore = (contractorId: string) => {
  const deliveryStats = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status IN ('VERIFIED', 'COMPLETED') THEN 1 ELSE 0 END) AS successful
    FROM deliveries
    WHERE contractor_id = ?
  `).get(contractorId) as any;

  const projectStats = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed
    FROM projects
    WHERE contractor_id = ?
  `).get(contractorId) as any;

  const reportStats = db.prepare(`
    SELECT COUNT(*) AS unresolved
    FROM reports r
    JOIN projects p ON p.id = r.project_id
    WHERE p.contractor_id = ? AND r.status != 'RESOLVED'
  `).get(contractorId) as any;

  const deliveryAccuracy = deliveryStats.total ? (deliveryStats.successful / deliveryStats.total) * 100 : 100;
  const completionRate = projectStats.total ? (projectStats.completed / projectStats.total) * 100 : 100;
  const unresolved = reportStats.unresolved || 0;
  const infraTrustScore = Math.max(0, Math.min(100, deliveryAccuracy * 0.45 + completionRate * 0.4 + (15 - unresolved * 3)));

  db.prepare(`
    INSERT INTO contractor_scores (contractor_id, delivery_accuracy, complaints, durability, infra_trust_score, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(contractor_id) DO UPDATE SET
      delivery_accuracy = excluded.delivery_accuracy,
      complaints = excluded.complaints,
      durability = excluded.durability,
      infra_trust_score = excluded.infra_trust_score,
      updated_at = CURRENT_TIMESTAMP
  `).run(contractorId, deliveryAccuracy, unresolved, completionRate, infraTrustScore);

  return infraTrustScore;
};

export const getContractors = (req: Request, res: Response) => {
  try {
    if (req.query.role) {
      return getUsersByRole(req, res);
    }

    const contractors = db.prepare(`
      SELECT
        u.id, u.name, u.email, u.phone, u.city, u.district, u.state,
        COALESCE(cs.delivery_accuracy, 100) AS delivery_accuracy,
        COALESCE(cs.complaints, 0) AS complaints,
        COALESCE(cs.durability, 100) AS durability,
        COALESCE(cs.infra_trust_score, 100) AS infra_trust_score
      FROM users u
      LEFT JOIN contractor_scores cs ON cs.contractor_id = u.id
      WHERE u.role = 'CONTRACTOR'
      ORDER BY u.name
    `).all();
    res.json({ status: 'success', contractors });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contractors' });
  }
};

export const getUsersByRole = (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const query = role
      ? 'SELECT id, name, email, phone, role, city, district, state FROM users WHERE role = ? ORDER BY name'
      : 'SELECT id, name, email, phone, role, city, district, state FROM users ORDER BY name';
    const users = role ? db.prepare(query).all(role) : db.prepare(query).all();
    res.json({ status: 'success', data: { users } });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
};
