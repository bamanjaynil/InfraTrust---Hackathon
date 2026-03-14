import { Request, Response } from 'express';
import db from '../db.js';
import { recalculateContractorScore } from './contractorController.js';

export const getProjects = (req: Request, res: Response) => {
  try {
    const { type, district, city, lat, lng, radius, contractor_id, search } = req.query;
    
    let query = `
      SELECT p.*, u.name as contractor_name 
      FROM projects p 
      LEFT JOIN users u ON p.contractor_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (contractor_id) {
      query += ' AND p.contractor_id = ?';
      params.push(contractor_id);
    }

    if (type === 'area' && district && city) {
      query += ' AND p.district = ? AND p.city = ?';
      params.push(district, city);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.city LIKE ? OR p.district LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    let projects = db.prepare(query).all(...params);

    if (type === 'nearby' && lat && lng && radius) {
      const R = 6371; 
      projects = projects.filter((p: any) => {
        const dLat = (p.start_lat - Number(lat)) * (Math.PI/180);
        const dLon = (p.start_lng - Number(lng)) * (Math.PI/180);
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(Number(lat) * (Math.PI/180)) * Math.cos(p.start_lat * (Math.PI/180)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; 
        return d <= Number(radius);
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
    const contractor_id = req.user?.id;
    if (!contractor_id) {
      return res.status(400).json({ status: 'error', message: 'Contractor ID is required' });
    }
    
    const { status, search } = req.query;
    let query = `
      SELECT p.*, u.name as contractor_name 
      FROM projects p
      LEFT JOIN users u ON p.contractor_id = u.id
      WHERE p.contractor_id = ?
    `;
    const params: any[] = [contractor_id];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.city LIKE ? OR p.district LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const projects = db.prepare(query).all(...params);
    
    res.json({ status: 'success', data: projects });
  } catch (error) {
    console.error('Error fetching contractor projects:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contractor projects' });
  }
};

export const createProject = (req: Request, res: Response) => {
  const { 
    name, start_lat, start_lng, end_lat, end_lng, 
    state, district, city, soil_type, road_type, 
    length, width, contractor_id 
  } = req.body;

  // Basic Validation
  if (!name || !state || !district || !city || !length || !width) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  const id = `proj-${Date.now()}`;
  
  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, start_lat, start_lng, end_lat, end_lng, state, district, city, soil_type, road_type, length, width, contractor_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertBoq = db.prepare(`
    INSERT INTO boq (id, project_id, bitumen, aggregate, cement, sand, estimated_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertProject.run(
      id, name, 
      Number(start_lat) || 0, Number(start_lng) || 0, 
      Number(end_lat) || 0, Number(end_lng) || 0, 
      state, district, city, soil_type, road_type, 
      Number(length), Number(width), 
      contractor_id || null, 'PLANNED'
    );
    
    // AI estimation for BoQ
    const bitumen = Number(length) * Number(width) * 0.05;
    const aggregate = Number(length) * Number(width) * 0.2;
    const cement = Number(length) * Number(width) * 0.1;
    const sand = Number(length) * Number(width) * 0.15;
    const estimated_cost = (bitumen * 100) + (aggregate * 50) + (cement * 80) + (sand * 30);
    
    insertBoq.run(`boq-${id}`, id, bitumen, aggregate, cement, sand, estimated_cost);
    
    return { id, name };
  });

  try {
    const result = transaction();
    res.status(201).json({ status: 'success', data: { project: { ...result, status: 'PLANNED' } } });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create project' });
  }
};

export const getProjectById = (req: Request, res: Response) => {
  try {
    const project = db.prepare(`
      SELECT p.*, u.name as contractor_name 
      FROM projects p 
      LEFT JOIN users u ON p.contractor_id = u.id 
      WHERE p.id = ?
    `).get(req.params.id);
    
    if (!project) return res.status(404).json({ status: 'error', message: 'Project not found' });
    
    const boq = db.prepare('SELECT * FROM boq WHERE project_id = ?').get(req.params.id);
    const deliveries = db.prepare('SELECT * FROM deliveries WHERE project_id = ?').all(req.params.id);
    
    res.json({ status: 'success', data: { project, boq, deliveries } });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch project details' });
  }
};

export const updateProjectStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    db.prepare('UPDATE projects SET status = ? WHERE id = ?').run(status, id);
    
    // If status changed to COMPLETED, recalculate contractor score
    if (status === 'COMPLETED') {
      const project = db.prepare('SELECT contractor_id FROM projects WHERE id = ?').get(id) as any;
      if (project && project.contractor_id) {
        recalculateContractorScore(project.contractor_id);
      }
    }

    res.json({ status: 'success', message: 'Project status updated' });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update project status' });
  }
};
