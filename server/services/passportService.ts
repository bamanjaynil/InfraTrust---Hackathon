import QRCode from 'qrcode';
import db from '../db.js';

export const createPassport = async (passportData: any) => {
  const { project_id, material_type, quantity, truck_number, driver_id } = passportData;
  if (!project_id || !material_type || !quantity || !truck_number) {
    throw new Error('project_id, material_type, quantity, and truck_number are required');
  }

  const project = db.prepare('SELECT id, status FROM projects WHERE id = ?').get(project_id) as any;
  if (!project) {
    throw new Error('Project not found');
  }

  if (!['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(project.status)) {
    throw new Error('Material passports can only be created for assigned projects');
  }

  const id = `passport-${Date.now()}`;
  const payload = {
    passport_id: id,
    project_id,
    material_type,
    quantity,
  };
  const qrCode = await QRCode.toDataURL(JSON.stringify(payload));

  db.prepare(`
    INSERT INTO material_passports (
      id, project_id, material_type, quantity, truck_number, driver_id, qr_code, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'DISPATCHED')
  `).run(id, project_id, material_type, quantity, truck_number, driver_id || null, qrCode);

  return { id, qrCode, payload };
};

export const verifyPassport = async (passport_id: string) => {
  const passport = db.prepare('SELECT * FROM material_passports WHERE id = ?').get(passport_id) as any;
  if (!passport) {
    throw new Error('Passport not found');
  }

  if (passport.status === 'VERIFIED') {
    return passport;
  }

  db.prepare(`UPDATE material_passports SET status = 'VERIFIED' WHERE id = ?`).run(passport_id);
  db.prepare(`
    UPDATE deliveries
    SET status = 'VERIFIED', verified_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP
    WHERE passport_id = ?
  `).run(passport_id);
  db.prepare(`
    UPDATE projects
    SET material_delivered = COALESCE(material_delivered, 0) + ?
    WHERE id = ?
  `).run(passport.quantity, passport.project_id);

  return passport;
};
