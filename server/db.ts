import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'infratrust.db'));
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS driver_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      phone TEXT,
      truck_plate TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      start_lat REAL NOT NULL,
      start_lng REAL NOT NULL,
      end_lat REAL NOT NULL,
      end_lng REAL NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      city TEXT NOT NULL,
      soil_type TEXT NOT NULL,
      road_type TEXT NOT NULL,
      length REAL NOT NULL,
      width REAL NOT NULL,
      contractor_id TEXT,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(contractor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS boq (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      bitumen REAL NOT NULL,
      aggregate REAL NOT NULL,
      cement REAL NOT NULL,
      sand REAL NOT NULL,
      estimated_cost REAL NOT NULL,
      locked BOOLEAN DEFAULT 0,
      FOREIGN KEY(project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      driver_id TEXT,
      truck_id TEXT NOT NULL,
      material_type TEXT NOT NULL,
      volume REAL NOT NULL,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      arrival_time DATETIME,
      completion_time DATETIME,
      FOREIGN KEY(project_id) REFERENCES projects(id),
      FOREIGN KEY(driver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      truck_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT,
      description TEXT NOT NULL,
      photo_url TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      status TEXT DEFAULT 'OPEN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS material_requests (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      contractor_id TEXT NOT NULL,
      material_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      priority TEXT DEFAULT 'NORMAL',
      requested_date DATETIME NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id),
      FOREIGN KEY(contractor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS material_passports (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      material_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      factory_name TEXT NOT NULL,
      truck_id TEXT NOT NULL,
      dispatch_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      qr_code TEXT NOT NULL,
      status TEXT DEFAULT 'DISPATCHED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id),
      FOREIGN KEY(truck_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      passport_id TEXT NOT NULL,
      driver_id TEXT,
      truck_number TEXT,
      status TEXT NOT NULL,
      started_at DATETIME,
      completed_at DATETIME,
      FOREIGN KEY(passport_id) REFERENCES material_passports(id),
      FOREIGN KEY(driver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS truck_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      truck_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(truck_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS trust_scores (
      contractor_id TEXT PRIMARY KEY,
      score INTEGER DEFAULT 100,
      projects_completed INTEGER DEFAULT 0,
      complaints INTEGER DEFAULT 0,
      delivery_issues INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(contractor_id) REFERENCES users(id)
    );
  `);
  try {
    db.prepare('SELECT driver_id FROM deliveries LIMIT 1').get();
  } catch (e) {
    db.exec('ALTER TABLE deliveries ADD COLUMN driver_id TEXT');
  }

  try {
    db.prepare('SELECT arrival_time FROM deliveries LIMIT 1').get();
  } catch (e) {
    db.exec('ALTER TABLE deliveries ADD COLUMN arrival_time DATETIME');
  }

  try {
    db.prepare('SELECT completion_time FROM deliveries LIMIT 1').get();
  } catch (e) {
    db.exec('ALTER TABLE deliveries ADD COLUMN completion_time DATETIME');
  }

  // Assign existing deliveries to driver-1 if they have no driver
  db.exec("UPDATE deliveries SET driver_id = 'driver-1' WHERE driver_id IS NULL");

  // Ensure driver-1 has a profile
  try {
    const driverProfile = db.prepare('SELECT id FROM driver_profiles WHERE user_id = ?').get('driver-1');
    if (!driverProfile) {
      db.prepare('INSERT INTO driver_profiles (id, user_id, phone, truck_plate) VALUES (?, ?, ?, ?)').run('dp-1', 'driver-1', '123-456-7890', 'TRK-1234');
    }
  } catch (e) {
    console.error('Error migrating driver profile:', e);
  }

  // Seed initial data if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (id, name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)');
    insertUser.run('admin-1', 'Admin User', 'admin@infratrust.gov', 'ADMIN', 'hash');
    insertUser.run('contractor-1', 'Acme Construction', 'contact@acme.com', 'CONTRACTOR', 'hash');
    insertUser.run('driver-1', 'John Driver', 'john@logistics.com', 'DRIVER', 'hash');
    insertUser.run('citizen-1', 'Jane Citizen', 'jane@citizen.org', 'CITIZEN', 'hash');

    const insertDriverProfile = db.prepare('INSERT INTO driver_profiles (id, user_id, phone, truck_plate) VALUES (?, ?, ?, ?)');
    insertDriverProfile.run('dp-1', 'driver-1', '123-456-7890', 'TRK-1234');

    const insertScore = db.prepare('INSERT INTO contractor_scores (contractor_id, infra_trust_score) VALUES (?, ?)');
    insertScore.run('contractor-1', 95);

    const insertProject = db.prepare(`
      INSERT INTO projects (id, name, start_lat, start_lng, end_lat, end_lng, state, district, city, soil_type, road_type, length, width, contractor_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertProject.run('proj-1', 'Main Street Roadwork', 12.9716, 77.5946, 12.9719, 77.5949, 'Karnataka', 'Bangalore', 'Bangalore', 'Clay', 'Asphalt', 1.5, 7.5, 'contractor-1', 'ONGOING');

    const insertDelivery = db.prepare(`
      INSERT INTO deliveries (id, project_id, truck_id, material_type, volume, status, driver_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertDelivery.run('del-seed-1', 'proj-1', 'KA-01-HH-1234', 'Bitumen', 15.5, 'ASSIGNED', 'driver-1');
  }
}

export default db;
