import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import db, { uploadDir } from '../db.js';
import aiEstimatorService from '../services/aiEstimatorService.js';

const parseUploadedFile = (fileData: any) => {
  if (!fileData?.base64 || !fileData?.name) {
    return null;
  }

  const safeName = `${Date.now()}-${String(fileData.name).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const fullPath = path.join(uploadDir, safeName);
  const normalized = String(fileData.base64).includes(',') ? String(fileData.base64).split(',')[1] : String(fileData.base64);
  fs.writeFileSync(fullPath, Buffer.from(normalized, 'base64'));
  return fullPath;
};

const baseProjectQuery = `
  SELECT
    p.*,
    u.name AS contractor_name,
    u.email AS contractor_email,
    b.bitumen AS bitumen_required,
    b.aggregate AS aggregate_required,
    b.sand AS sand_required,
    b.cement AS cement_required
  FROM projects p
  LEFT JOIN users u ON u.id = p.contractor_id
  LEFT JOIN boq b ON b.project_id = p.id
`;

export const getProjects = (req: Request, res: Response) => {
  try {
    const { type, district, city, lat, lng, radius, contractor_id, search, status } = req.query as any;
    let query = `${baseProjectQuery} WHERE 1 = 1`;
    const params: any[] = [];

    if (contractor_id) {
      query += ' AND p.contractor_id = ?';
      params.push(contractor_id);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (type === 'area' && district) {
      query += ' AND p.district = ?';
      params.push(district);
      if (city) {
        query += ' AND p.city = ?';
        params.push(city);
      }
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.city LIKE ? OR p.district LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC';
    let projects = db.prepare(query).all(...params) as any[];

    if (type === 'nearby' && lat && lng) {
      const radiusKm = Number(radius) || 20;
      projects = projects.filter((project) => {
        const dx = (Number(project.start_lat) - Number(lat)) * 111;
        const dy = (Number(project.start_lng) - Number(lng)) * 111;
        return Math.sqrt(dx * dx + dy * dy) <= radiusKm;
      });
    }

    res.json({ status: 'success', projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch projects' });
  }
};

export const getContractorProjects = (req: Request, res: Response) => {
  try {
    const { search = '', status = '' } = req.query as any;
    const openProjects = db.prepare(`
      ${baseProjectQuery}
      WHERE p.status = 'OPEN_FOR_BIDDING'
        AND (? = '' OR p.name LIKE ? OR p.city LIKE ? OR p.district LIKE ?)
      ORDER BY p.created_at DESC
    `).all(search, `%${search}%`, `%${search}%`, `%${search}%`);

    const assignedProjects = db.prepare(`
      ${baseProjectQuery}
      WHERE p.contractor_id = ?
        AND (? = '' OR p.status = ?)
        AND (? = '' OR p.name LIKE ? OR p.city LIKE ? OR p.district LIKE ?)
      ORDER BY p.created_at DESC
    `).all(req.user.id, status, status, search, `%${search}%`, `%${search}%`, `%${search}%`);

    const myApplications = db.prepare(`
      SELECT
        pa.*,
        p.name AS project_name,
        p.city,
        p.district,
        p.state,
        p.status AS project_status
      FROM project_applications pa
      JOIN projects p ON p.id = pa.project_id
      WHERE pa.contractor_id = ?
      ORDER BY pa.created_at DESC
    `).all(req.user.id);

    res.json({ status: 'success', data: { openProjects, myApplications, assignedProjects } });
  } catch (error) {
    console.error('Error fetching contractor projects:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contractor projects' });
  }
};

export const createProject = (req: Request, res: Response) => {
  try {
    const {
      name,
      state,
      district,
      city,
      road_length,
      road_width,
      length,
      width,
      soil_type,
      soil_report_text,
      soil_report_file,
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      road_type,
    } = req.body;

    const normalizedLength = Number(road_length ?? length);
    const normalizedWidth = Number(road_width ?? width);

    if (!name || !state || !district || !city || !normalizedLength || !normalizedWidth || !soil_type) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    if (!soil_report_text && !soil_report_file?.base64) {
      return res.status(400).json({ status: 'error', message: 'A soil report file or text summary is required' });
    }

    const id = `project-${Date.now()}`;
    const reportPath = parseUploadedFile(soil_report_file);
    const estimation = aiEstimatorService.estimateRoadMaterials({
      road_length: normalizedLength,
      road_width: normalizedWidth,
      soil_type,
      soil_report_text: soil_report_text || '',
    });

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO projects (
          id, name, state, district, city, road_length, road_width, soil_type, soil_report_file, soil_report_text,
          estimated_budget, status, created_by, start_lat, start_lng, end_lat, end_lng, road_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN_FOR_BIDDING', ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        name,
        state,
        district,
        city,
        normalizedLength,
        normalizedWidth,
        soil_type,
        reportPath,
        soil_report_text || '',
        estimation.estimated_cost,
        req.user?.id || 'admin-1',
        Number(start_lat) || 0,
        Number(start_lng) || 0,
        Number(end_lat) || 0,
        Number(end_lng) || 0,
        road_type || 'ROAD',
      );

      db.prepare(`
        INSERT INTO boq (id, project_id, bitumen, aggregate, sand, cement, estimated_cost, soil_report_text, locked)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        `boq-${id}`,
        id,
        estimation.bitumen_required,
        estimation.aggregate_required,
        estimation.sand_required,
        estimation.cement_required,
        estimation.estimated_cost,
        soil_report_text || '',
      );
    });

    tx();

    res.status(201).json({
      status: 'success',
      data: {
        project: { id, name, status: 'OPEN_FOR_BIDDING' },
        estimation,
      },
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create project' });
  }
};

export const getProjectById = (req: Request, res: Response) => {
  try {
    const project = db.prepare(`${baseProjectQuery} WHERE p.id = ?`).get(req.params.id) as any;
    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found' });
    }

    const boq = db.prepare('SELECT * FROM boq WHERE project_id = ?').get(req.params.id);
    const deliveries = db.prepare(`
      SELECT d.*, mp.qr_code, mp.status AS passport_status
      FROM deliveries d
      LEFT JOIN material_passports mp ON mp.id = d.passport_id
      WHERE d.project_id = ?
      ORDER BY d.timestamp DESC
    `).all(req.params.id);
    const applications = db.prepare(`
      SELECT pa.*, u.name AS contractor_name, u.email AS contractor_email
      FROM project_applications pa
      JOIN users u ON u.id = pa.contractor_id
      WHERE pa.project_id = ?
      ORDER BY pa.created_at DESC
    `).all(req.params.id);
    const reports = db.prepare(`
      SELECT r.*, u.name AS reporter_name
      FROM reports r
      JOIN users u ON u.id = r.user_id
      WHERE r.project_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.id);
    const passports = db.prepare('SELECT * FROM material_passports WHERE project_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({ status: 'success', data: { project, boq, deliveries, applications, reports, passports } });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch project details' });
  }
};

export const updateProjectStatus = (req: Request, res: Response) => {
  try {
    const allowedStatuses = ['OPEN_FOR_BIDDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
    const nextStatus = String(req.body.status || '');
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ status: 'error', message: 'Invalid project status' });
    }

    const project = db.prepare('SELECT id, contractor_id, status FROM projects WHERE id = ?').get(req.params.id) as any;
    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found' });
    }

    if (req.user?.role === 'CONTRACTOR' && project.contractor_id !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'You can only update your assigned projects' });
    }

    if (req.user?.role === 'CONTRACTOR' && ['OPEN_FOR_BIDDING', 'ASSIGNED'].includes(nextStatus)) {
      return res.status(403).json({ status: 'error', message: 'Contractors can only move projects to in-progress or completed' });
    }

    db.prepare('UPDATE projects SET status = ? WHERE id = ?').run(nextStatus, req.params.id);
    res.json({ status: 'success', message: 'Project status updated' });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update project status' });
  }
};

export const applyToProject = (req: Request, res: Response) => {
  try {
    const project = db.prepare('SELECT id, status FROM projects WHERE id = ?').get(req.params.id) as any;
    if (!project || project.status !== 'OPEN_FOR_BIDDING') {
      return res.status(400).json({ status: 'error', message: 'Project is not open for bidding' });
    }

    if (!Number(req.body.bid_amount)) {
      return res.status(400).json({ status: 'error', message: 'A valid bid amount is required' });
    }

    const id = `application-${Date.now()}`;
    db.prepare(`
      INSERT INTO project_applications (id, project_id, contractor_id, bid_amount, proposal_text, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `).run(id, req.params.id, req.user.id, req.body.bid_amount, req.body.proposal_text || '');

    res.status(201).json({ status: 'success', data: { id } });
  } catch (error: any) {
    console.error('Error applying to project:', error);
    const message = String(error?.message || '').includes('UNIQUE')
      ? 'You have already applied to this project'
      : 'Failed to submit application';
    res.status(400).json({ status: 'error', message });
  }
};

export const approveApplication = (req: Request, res: Response) => {
  try {
    const application = db.prepare('SELECT * FROM project_applications WHERE id = ?').get(req.params.applicationId) as any;
    if (!application) {
      return res.status(404).json({ status: 'error', message: 'Application not found' });
    }

    const project = db.prepare('SELECT id, status FROM projects WHERE id = ?').get(application.project_id) as any;
    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found' });
    }

    if (project.status !== 'OPEN_FOR_BIDDING') {
      return res.status(400).json({ status: 'error', message: 'This project is no longer open for bidding' });
    }

    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE project_applications
        SET status = CASE WHEN id = ? THEN 'APPROVED' ELSE 'REJECTED' END
        WHERE project_id = ?
      `).run(req.params.applicationId, application.project_id);
      db.prepare(`
        UPDATE projects
        SET contractor_id = ?, status = 'ASSIGNED'
        WHERE id = ?
      `).run(application.contractor_id, application.project_id);
    });

    tx();

    res.json({ status: 'success', message: 'Contractor selected successfully' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ status: 'error', message: 'Failed to approve application' });
  }
};
