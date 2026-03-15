import { Request, Response } from 'express';
import db from '../db.js';
import { recalculateContractorScore } from './contractorController.js';
import * as passportService from '../services/passportService.js';

const deliveryQuery = `
  SELECT
    d.*,
    p.name AS project_name,
    p.city,
    p.district,
    p.state,
    u.name AS driver_name,
    mp.qr_code,
    mp.status AS passport_status,
    mp.dispatch_time,
    mp.truck_number
  FROM deliveries d
  JOIN projects p ON p.id = d.project_id
  LEFT JOIN material_passports mp ON mp.id = d.passport_id
  LEFT JOIN users u ON u.id = d.driver_id
`;

export const getDeliveries = (_req: Request, res: Response) => {
  try {
    const deliveries = db.prepare(`${deliveryQuery} ORDER BY d.timestamp DESC`).all();
    res.json({ status: 'success', data: deliveries });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch deliveries' });
  }
};

export const getDeliveriesByDriver = (req: Request, res: Response) => {
  try {
    const driverId = String(req.query.driver_id || '');
    if (!driverId) {
      return res.status(400).json({ status: 'error', message: 'Driver ID is required' });
    }

    const deliveries = db.prepare(`${deliveryQuery} WHERE d.driver_id = ? ORDER BY d.timestamp DESC`).all(driverId);
    res.json({ status: 'success', data: deliveries });
  } catch (error) {
    console.error('Error fetching driver deliveries:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch driver deliveries' });
  }
};

export const getDeliveriesByDriverId = (req: Request, res: Response) => {
  req.query.driver_id = req.params.driverId;
  return getDeliveriesByDriver(req, res);
};

export const getDeliveriesByContractor = (req: Request, res: Response) => {
  try {
    const deliveries = db.prepare(`${deliveryQuery} WHERE d.contractor_id = ? ORDER BY d.timestamp DESC`).all(req.user.id);
    res.json({ status: 'success', data: deliveries });
  } catch (error) {
    console.error('Error fetching contractor deliveries:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contractor deliveries' });
  }
};

export const getDeliveryById = (req: Request, res: Response) => {
  try {
    const delivery = db.prepare(`${deliveryQuery} WHERE d.id = ?`).get(req.params.id);
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
    const { passport_id, project_id, contractor_id, driver_id, truck_number, material_type, volume } = req.body;
    const id = `delivery-${Date.now()}`;
    db.prepare(`
      INSERT INTO deliveries (id, passport_id, project_id, contractor_id, driver_id, truck_number, material_type, volume, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ASSIGNED')
    `).run(id, passport_id || null, project_id, contractor_id || null, driver_id || null, truck_number || null, material_type || null, volume || null);
    res.status(201).json({ status: 'success', id, message: 'Delivery created' });
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create delivery' });
  }
};

export const updateDeliveryStatus = (req: Request, res: Response) => {
  try {
    db.prepare('UPDATE deliveries SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    res.json({ status: 'success', message: 'Delivery status updated' });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update delivery status' });
  }
};

export const startDelivery = (req: Request, res: Response) => {
  try {
    const delivery = db.prepare('SELECT id, driver_id, passport_id, status FROM deliveries WHERE id = ?').get(req.params.id) as any;
    if (!delivery) {
      return res.status(404).json({ status: 'error', message: 'Delivery not found' });
    }

    if (delivery.driver_id && delivery.driver_id !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'This delivery is assigned to another driver' });
    }

    db.prepare(`UPDATE deliveries SET status = 'IN_TRANSIT', started_at = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);
    db.prepare(`
      UPDATE material_passports
      SET status = 'IN_TRANSIT'
      WHERE id = (SELECT passport_id FROM deliveries WHERE id = ?)
    `).run(req.params.id);
    res.json({ status: 'success', message: 'Delivery started' });
  } catch (error) {
    console.error('Error starting delivery:', error);
    res.status(500).json({ status: 'error', message: 'Failed to start delivery' });
  }
};

export const startDeliveryByBody = (req: Request, res: Response) => {
  req.params.id = req.body.delivery_id;
  return startDelivery(req, res);
};

export const markArrived = (req: Request, res: Response) => {
  try {
    const delivery = db.prepare('SELECT id, driver_id FROM deliveries WHERE id = ?').get(req.params.id) as any;
    if (!delivery) {
      return res.status(404).json({ status: 'error', message: 'Delivery not found' });
    }

    if (delivery.driver_id && delivery.driver_id !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'This delivery is assigned to another driver' });
    }

    db.prepare(`UPDATE deliveries SET status = 'ARRIVED', arrived_at = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);
    db.prepare(`
      UPDATE material_passports
      SET status = 'ARRIVED'
      WHERE id = (SELECT passport_id FROM deliveries WHERE id = ?)
    `).run(req.params.id);
    res.json({ status: 'success', message: 'Delivery marked as arrived' });
  } catch (error) {
    console.error('Error marking arrival:', error);
    res.status(500).json({ status: 'error', message: 'Failed to mark arrival' });
  }
};

export const markArrivedByBody = (req: Request, res: Response) => {
  req.params.id = req.body.delivery_id;
  return markArrived(req, res);
};

export const completeDelivery = (req: Request, res: Response) => {
  try {
    const deliveryRecord = db.prepare('SELECT id, driver_id, contractor_id FROM deliveries WHERE id = ?').get(req.params.id) as any;
    if (!deliveryRecord) {
      return res.status(404).json({ status: 'error', message: 'Delivery not found' });
    }

    if (deliveryRecord.driver_id && deliveryRecord.driver_id !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'This delivery is assigned to another driver' });
    }

    db.prepare(`UPDATE deliveries SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);
    const delivery = db.prepare('SELECT contractor_id FROM deliveries WHERE id = ?').get(req.params.id) as any;
    if (delivery?.contractor_id) {
      recalculateContractorScore(delivery.contractor_id);
    }
    res.json({ status: 'success', message: 'Delivery completed' });
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({ status: 'error', message: 'Failed to complete delivery' });
  }
};

export const assignDriver = (req: Request, res: Response) => {
  try {
    const { delivery_id, driver_id } = req.body;
    if (!delivery_id || !driver_id) {
      return res.status(400).json({ status: 'error', message: 'delivery_id and driver_id are required' });
    }

    db.prepare(`UPDATE deliveries SET driver_id = ?, status = 'ASSIGNED' WHERE id = ?`).run(driver_id, delivery_id);
    db.prepare(`
      UPDATE material_passports
      SET driver_id = ?
      WHERE id = (SELECT passport_id FROM deliveries WHERE id = ?)
    `).run(driver_id, delivery_id);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ status: 'error', message: 'Failed to assign driver' });
  }
};

export const verifyDelivery = async (req: Request, res: Response) => {
  try {
    const { passport_id, arrival_lat, arrival_lng } = req.body;
    if (!passport_id) {
      return res.status(400).json({ status: 'error', message: 'passport_id is required' });
    }

    const linkedDelivery = db.prepare('SELECT id, driver_id, contractor_id FROM deliveries WHERE passport_id = ?').get(passport_id) as any;
    if (!linkedDelivery) {
      return res.status(404).json({ status: 'error', message: 'No delivery found for this passport' });
    }

    if (linkedDelivery.driver_id && linkedDelivery.driver_id !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'This passport belongs to another driver delivery' });
    }

    const passport = await passportService.verifyPassport(passport_id);
    db.prepare(`
      INSERT INTO truck_tracking (truck_id, latitude, longitude, timestamp)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(passport.truck_number, arrival_lat || 0, arrival_lng || 0);

    const delivery = db.prepare('SELECT contractor_id FROM deliveries WHERE passport_id = ?').get(passport_id) as any;
    if (delivery?.contractor_id) {
      recalculateContractorScore(delivery.contractor_id);
    }

    res.json({ status: 'success', data: passport });
  } catch (error) {
    console.error('Error verifying delivery:', error);
    res.status(400).json({ status: 'error', message: 'Failed to verify delivery' });
  }
};
