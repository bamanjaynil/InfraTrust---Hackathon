import { Request, Response } from 'express';
import db from '../db.js';
import { recalculateContractorScore } from './contractorController.js';

export const getDeliveries = (req: Request, res: Response) => {
  try {
    const { driver_id } = req.query;
    let query = `
      SELECT d.*, p.name as project_name 
      FROM deliveries d
      LEFT JOIN projects p ON d.project_id = p.id
    `;
    const params: any[] = [];

    if (driver_id) {
      query += ' WHERE d.driver_id = ?';
      params.push(driver_id);
    }

    const deliveries = db.prepare(query).all(...params);
    res.json({ status: 'success', data: deliveries });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch deliveries' });
  }
};

export const getDeliveriesByDriver = (req: Request, res: Response) => {
  try {
    const driver_id = req.query.driver_id; // Use query param
    if (!driver_id) {
      return res.status(400).json({ status: 'error', message: 'Driver ID is required' });
    }
    
    const deliveries = db.prepare(`
      SELECT d.*, p.name as project_name 
      FROM deliveries d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.driver_id = ?
    `).all(driver_id);
    
    res.json({ status: 'success', data: deliveries });
  } catch (error) {
    console.error('Error fetching driver deliveries:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch driver deliveries' });
  }
};

export const getDeliveriesByContractor = (req: Request, res: Response) => {
  try {
    const contractor_id = req.user?.id;
    if (!contractor_id) {
      return res.status(400).json({ status: 'error', message: 'Contractor ID is required' });
    }
    
    const deliveries = db.prepare(`
      SELECT d.*, p.name as project_name, u.name as driver_name
      FROM deliveries d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN users u ON d.driver_id = u.id
      WHERE p.contractor_id = ?
    `).all(contractor_id);
    
    res.json({ status: 'success', data: deliveries });
  } catch (error) {
    console.error('Error fetching contractor deliveries:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contractor deliveries' });
  }
};

export const getDeliveryById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const delivery = db.prepare(`
      SELECT d.*, p.name as project_name, p.city, p.district, p.state
      FROM deliveries d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.id = ?
    `).get(id);

    if (!delivery) {
      return res.status(404).json({ status: 'error', message: 'Delivery not found' });
    }

    res.json({ status: 'success', data: delivery });
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch delivery' });
  }
};

export const createDelivery = (req: Request, res: Response) => {
  try {
    const { project_id, truck_id, material_type, volume, driver_id } = req.body;
    const id = `del-${Date.now()}`;
    
    const insert = db.prepare(`
      INSERT INTO deliveries (id, project_id, truck_id, material_type, volume, status, driver_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(id, project_id, truck_id, material_type, volume, 'ASSIGNED', driver_id || null);
    res.status(201).json({ status: 'success', id, message: 'Delivery created' });
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create delivery' });
  }
};

export const startDelivery = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE deliveries SET status = 'IN_TRANSIT' WHERE id = ?").run(id);
    res.json({ status: 'success', message: 'Delivery started' });
  } catch (error) {
    console.error('Error starting delivery:', error);
    res.status(500).json({ status: 'error', message: 'Failed to start delivery' });
  }
};

export const markArrived = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE deliveries SET status = 'ARRIVED', arrival_time = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    res.json({ status: 'success', message: 'Delivery marked as arrived' });
  } catch (error) {
    console.error('Error marking arrival:', error);
    res.status(500).json({ status: 'error', message: 'Failed to mark arrival' });
  }
};

export const completeDelivery = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE deliveries SET status = 'COMPLETED', completion_time = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    
    // Recalculate contractor score
    const delivery = db.prepare(`
      SELECT p.contractor_id 
      FROM deliveries d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = ?
    `).get(id) as any;
    
    if (delivery && delivery.contractor_id) {
      recalculateContractorScore(delivery.contractor_id);
    }

    res.json({ status: 'success', message: 'Delivery completed' });
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({ status: 'error', message: 'Failed to complete delivery' });
  }
};

export const addTrackingData = (req: Request, res: Response) => {
  try {
    const { truck_id, latitude, longitude } = req.body;
    db.prepare(`
      INSERT INTO tracking (truck_id, latitude, longitude)
      VALUES (?, ?, ?)
    `).run(truck_id, latitude, longitude);
    res.json({ status: 'success', message: 'Tracking data recorded' });
  } catch (error) {
    console.error('Error recording tracking data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to record tracking data' });
  }
};

export const updateDeliveryStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    db.prepare('UPDATE deliveries SET status = ? WHERE id = ?').run(status, id);
    
    // If status changed to COMPLETED, recalculate contractor score
    if (status === 'COMPLETED') {
      const delivery = db.prepare(`
        SELECT p.contractor_id 
        FROM deliveries d
        JOIN projects p ON d.project_id = p.id
        WHERE d.id = ?
      `).get(id) as any;
      
      if (delivery && delivery.contractor_id) {
        recalculateContractorScore(delivery.contractor_id);
      }
    }

    res.json({ status: 'success', message: 'Delivery status updated' });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update delivery status' });
  }
};

export const assignDriver = (req: Request, res: Response) => {
  try {
    const { delivery_id, driver_id } = req.body;
    db.prepare('UPDATE deliveries SET driver_id = ?, status = ? WHERE id = ?').run(driver_id, 'ASSIGNED', delivery_id);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ status: 'error', message: 'Failed to assign driver' });
  }
};

export const verifyDelivery = (req: Request, res: Response) => {
  try {
    const { passport_id, arrival_lat, arrival_lng } = req.body;
    db.prepare("UPDATE deliveries SET status = 'VERIFIED', completed_at = CURRENT_TIMESTAMP WHERE passport_id = ?").run(passport_id);
    // Also record tracking data
    db.prepare('INSERT INTO truck_tracking (truck_id, latitude, longitude) VALUES (?, ?, ?)').run('TRK-001', arrival_lat, arrival_lng);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error verifying delivery:', error);
    res.status(500).json({ status: 'error', message: 'Failed to verify delivery' });
  }
};

export const getDeliveriesByDriverId = (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const deliveries = db.prepare('SELECT * FROM deliveries WHERE driver_id = ?').all(driverId);
    res.json({ status: 'success', data: deliveries });
  } catch (error) {
    console.error('Error fetching deliveries by driver:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch deliveries' });
  }
};
