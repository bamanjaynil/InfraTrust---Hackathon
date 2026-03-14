import db from '../db.js';

export interface Report {
  id: string;
  user_id: string;
  project_id?: string | null;
  description: string;
  photo_url?: string | null;
  latitude: number;
  longitude: number;
  status: string;
  created_at?: string;
}

export const createReport = (report: Report) => {
  const insert = db.prepare(`
    INSERT INTO reports (id, user_id, project_id, description, photo_url, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    report.id,
    report.user_id,
    report.project_id || null,
    report.description,
    report.photo_url || null,
    report.latitude,
    report.longitude,
    report.status || 'OPEN'
  );
  return db.prepare('SELECT * FROM reports WHERE id = ?').get(report.id);
};

export const getReportsByUserId = (userId: string) => {
  return db.prepare('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC').all(userId);
};

export const getAllReports = () => {
  return db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
};
