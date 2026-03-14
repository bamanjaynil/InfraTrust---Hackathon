import db from '../db.js';
import QRCode from 'qrcode';

export const createPassport = async (passportData: any) => {
  const { project_id, material_type, quantity, factory_name, truck_id } = passportData;
  const id = `pass-${Date.now()}`;
  
  const qrPayload = JSON.stringify({
    passport_id: id,
    project_id,
    material_type,
    quantity,
    truck_id
  });
  
  const qrCode = await QRCode.toDataURL(qrPayload);
  
  const stmt = db.prepare(`
    INSERT INTO material_passports (id, project_id, material_type, quantity, factory_name, truck_id, qr_code)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, project_id, material_type, quantity, factory_name, truck_id, qrCode);
  
  return { id, qrCode };
};

export const verifyPassport = async (passport_id: string, arrival_lat: number, arrival_lng: number, arrival_time: string) => {
  const passport = db.prepare('SELECT * FROM material_passports WHERE id = ?').get(passport_id) as any;
  
  if (!passport) {
    throw new Error('Passport not found');
  }
  
  // Verify project location (simplified)
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(passport.project_id) as any;
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Update status
  db.prepare('UPDATE material_passports SET status = ? WHERE id = ?').run('VERIFIED', passport_id);
  
  return { status: 'VERIFIED' };
};
