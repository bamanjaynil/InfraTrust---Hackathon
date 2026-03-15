import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../data');
const uploadDir = path.join(dbDir, 'uploads');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'infratrust.db'));
db.pragma('foreign_keys = ON');

const ensureColumn = (table: string, column: string, definition: string) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

const tableExists = (table: string) => {
  const row = db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`).get(table);
  return Boolean(row);
};

const seedDemoUsers = () => {
  const passwordHash = bcrypt.hashSync('demo123', 10);
  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, email, phone, role, password_hash, state, district, city, pincode, latitude, longitude
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      phone = excluded.phone,
      role = excluded.role,
      password_hash = excluded.password_hash,
      state = excluded.state,
      district = excluded.district,
      city = excluded.city,
      pincode = excluded.pincode,
      latitude = excluded.latitude,
      longitude = excluded.longitude
  `);

  insertUser.run(
    'admin-1',
    'InfraTrust Admin',
    'admin@infratrust.com',
    '+910000000001',
    'ADMIN',
    passwordHash,
    'Maharashtra',
    'Pune',
    'Pune',
    '411001',
    18.5204,
    73.8567,
  );
  insertUser.run(
    'contractor-1',
    'InfraBuild Contractors',
    'contractor@infratrust.com',
    '+910000000002',
    'CONTRACTOR',
    passwordHash,
    'Maharashtra',
    'Pune',
    'Pune',
    '411001',
    18.5211,
    73.8572,
  );
  insertUser.run(
    'driver-1',
    'InfraTrust Driver',
    'driver@infratrust.com',
    '+910000000003',
    'DRIVER',
    passwordHash,
    'Maharashtra',
    'Pune',
    'Pune',
    '411001',
    18.5221,
    73.8584,
  );
  insertUser.run(
    'citizen-1',
    'Citizen Demo',
    'citizen@infratrust.com',
    '+910000000004',
    'CITIZEN',
    passwordHash,
    'Maharashtra',
    'Pune',
    'Pune',
    '411001',
    18.5242,
    73.8599,
  );

  db.prepare(`
    INSERT INTO driver_profiles (id, user_id, phone, truck_plate)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      phone = excluded.phone,
      truck_plate = excluded.truck_plate
  `).run('driver-profile-1', 'driver-1', '+910000000003', 'MH12AB1234');
};

const seedDemoData = () => {
  const openProjectExists = db.prepare('SELECT id FROM projects WHERE id = ?').get('project-open-1');
  if (!openProjectExists) {
    db.prepare(`
      INSERT INTO projects (
        id, name, state, district, city, road_length, road_width, soil_type, soil_report_file,
        soil_report_text, estimated_budget, status, created_by, contractor_id, start_lat, start_lng, end_lat, end_lng, road_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'project-open-1',
      'Pune Ring Road Rehabilitation',
      'Maharashtra',
      'Pune',
      'Pune',
      8.5,
      7.2,
      'CLAY',
      null,
      'Clay dominant surface with moderate moisture retention.',
      0,
      'OPEN_FOR_BIDDING',
      'admin-1',
      null,
      18.534,
      73.861,
      18.548,
      73.882,
      'URBAN',
    );
  }

  const assignedProjectExists = db.prepare('SELECT id FROM projects WHERE id = ?').get('project-assigned-1');
  if (!assignedProjectExists) {
    db.prepare(`
      INSERT INTO projects (
        id, name, state, district, city, road_length, road_width, soil_type, soil_report_file,
        soil_report_text, estimated_budget, status, created_by, contractor_id, start_lat, start_lng, end_lat, end_lng, road_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'project-assigned-1',
      'NH-48 Service Road Widening',
      'Maharashtra',
      'Pune',
      'Pune',
      5.2,
      9.5,
      'SANDY',
      null,
      'Sandy subgrade with low cohesion and high drainage.',
      0,
      'ASSIGNED',
      'admin-1',
      'contractor-1',
      18.501,
      73.879,
      18.514,
      73.901,
      'HIGHWAY',
    );
  }

  db.prepare(`
    INSERT INTO project_applications (id, project_id, contractor_id, bid_amount, proposal_text, status)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `).run(
    'application-demo-1',
    'project-open-1',
    'contractor-1',
    14850000,
    'We can mobilize within 10 days with dedicated QA, fleet, and soil stabilization support.',
    'PENDING',
  );

  const boqExists = db.prepare('SELECT id FROM boq WHERE project_id = ?').get('project-assigned-1');
  if (!boqExists) {
    db.prepare(`
      INSERT INTO boq (id, project_id, bitumen, aggregate, sand, cement, estimated_cost, soil_report_text, locked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'boq-project-assigned-1',
      'project-assigned-1',
      3.95,
      8.55,
      2.96,
      5.43,
      2460375,
      'Sandy subgrade with low cohesion and high drainage.',
      1,
    );
    db.prepare('UPDATE projects SET estimated_budget = ? WHERE id = ?').run(2460375, 'project-assigned-1');
  }

  db.prepare(`
    INSERT INTO material_passports (
      id, project_id, delivery_id, material_type, quantity, truck_number, driver_id, qr_code, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `).run(
    'passport-demo-1',
    'project-assigned-1',
    'delivery-demo-1',
    'Aggregate',
    22.5,
    'MH12AB1234',
    'driver-1',
    '',
    'DISPATCHED',
  );

  db.prepare(`
    INSERT INTO deliveries (
      id, passport_id, project_id, contractor_id, driver_id, truck_number, material_type, volume, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `).run(
    'delivery-demo-1',
    'passport-demo-1',
    'project-assigned-1',
    'contractor-1',
    'driver-1',
    'MH12AB1234',
    'Aggregate',
    22.5,
    'ASSIGNED',
  );

  db.prepare(`
    INSERT INTO contractor_scores (
      contractor_id, delivery_accuracy, complaints, durability, infra_trust_score, updated_at
    )
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(contractor_id) DO NOTHING
  `).run('contractor-1', 100, 0, 95, 98);
};

export function initDb() {
  if (tableExists('projects')) {
    const existingProjectColumns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
    const legacyProjects = existingProjectColumns.some((item) => ['length', 'width'].includes(item.name)) ||
      !existingProjectColumns.some((item) => item.name === 'road_length');

    if (legacyProjects) {
      db.exec(`
        DROP TABLE IF EXISTS project_applications;
        DROP TABLE IF EXISTS boq;
        DROP TABLE IF EXISTS deliveries;
        DROP TABLE IF EXISTS material_passports;
        DROP TABLE IF EXISTS material_requests;
        DROP TABLE IF EXISTS reports;
        DROP TABLE IF EXISTS truck_tracking;
        DROP TABLE IF EXISTS contractor_scores;
        DROP TABLE IF EXISTS projects;
      `);
    }
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('ADMIN', 'CONTRACTOR', 'DRIVER', 'CITIZEN')),
      password_hash TEXT NOT NULL,
      state TEXT,
      district TEXT,
      city TEXT,
      pincode TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS driver_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      phone TEXT,
      truck_plate TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      city TEXT NOT NULL,
      road_length REAL NOT NULL,
      road_width REAL NOT NULL,
      soil_type TEXT NOT NULL,
      soil_report_file TEXT,
      soil_report_text TEXT,
      estimated_budget REAL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('OPEN_FOR_BIDDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED')),
      created_by TEXT NOT NULL,
      contractor_id TEXT,
      start_lat REAL DEFAULT 0,
      start_lng REAL DEFAULT 0,
      end_lat REAL DEFAULT 0,
      end_lng REAL DEFAULT 0,
      road_type TEXT DEFAULT 'ROAD',
      material_delivered REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(contractor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS project_applications (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      contractor_id TEXT NOT NULL,
      bid_amount REAL NOT NULL,
      proposal_text TEXT,
      status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, contractor_id),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY(contractor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS boq (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL UNIQUE,
      bitumen REAL NOT NULL,
      aggregate REAL NOT NULL,
      sand REAL NOT NULL,
      cement REAL NOT NULL,
      estimated_cost REAL NOT NULL,
      soil_report_text TEXT,
      locked INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
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
      delivery_id TEXT,
      material_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      truck_number TEXT NOT NULL,
      driver_id TEXT,
      dispatch_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      qr_code TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'VERIFIED')) DEFAULT 'DISPATCHED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id),
      FOREIGN KEY(driver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      passport_id TEXT,
      project_id TEXT NOT NULL,
      contractor_id TEXT,
      driver_id TEXT,
      truck_number TEXT,
      material_type TEXT,
      volume REAL,
      status TEXT NOT NULL DEFAULT 'ASSIGNED',
      started_at DATETIME,
      arrived_at DATETIME,
      completed_at DATETIME,
      verified_at DATETIME,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(passport_id) REFERENCES material_passports(id),
      FOREIGN KEY(project_id) REFERENCES projects(id),
      FOREIGN KEY(contractor_id) REFERENCES users(id),
      FOREIGN KEY(driver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT,
      description TEXT NOT NULL,
      photo_url TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS truck_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      truck_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contractor_scores (
      contractor_id TEXT PRIMARY KEY,
      delivery_accuracy REAL DEFAULT 100,
      complaints INTEGER DEFAULT 0,
      durability REAL DEFAULT 100,
      infra_trust_score REAL DEFAULT 100,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(contractor_id) REFERENCES users(id)
    );
  `);

  ensureColumn('users', 'phone', 'TEXT');
  ensureColumn('users', 'state', 'TEXT');
  ensureColumn('users', 'district', 'TEXT');
  ensureColumn('users', 'city', 'TEXT');
  ensureColumn('users', 'pincode', 'TEXT');
  ensureColumn('users', 'latitude', 'REAL');
  ensureColumn('users', 'longitude', 'REAL');
  ensureColumn('projects', 'road_length', 'REAL DEFAULT 0');
  ensureColumn('projects', 'road_width', 'REAL DEFAULT 0');
  ensureColumn('projects', 'soil_report_file', 'TEXT');
  ensureColumn('projects', 'soil_report_text', 'TEXT');
  ensureColumn('projects', 'estimated_budget', 'REAL DEFAULT 0');
  ensureColumn('projects', 'created_by', 'TEXT');
  ensureColumn('projects', 'road_type', "TEXT DEFAULT 'ROAD'");
  ensureColumn('projects', 'material_delivered', 'REAL DEFAULT 0');
  ensureColumn('material_passports', 'delivery_id', 'TEXT');
  ensureColumn('material_passports', 'truck_number', 'TEXT');
  ensureColumn('material_passports', 'driver_id', 'TEXT');
  ensureColumn('deliveries', 'verified_at', 'DATETIME');
  ensureColumn('deliveries', 'truck_number', 'TEXT');

  const projectColumns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
  const hasLegacyLength = projectColumns.some((item) => item.name === 'length');
  const hasLegacyWidth = projectColumns.some((item) => item.name === 'width');

  if (hasLegacyLength) {
    db.exec(`UPDATE projects SET road_length = COALESCE(road_length, length, 0) WHERE road_length IS NULL OR road_length = 0`);
  }

  if (hasLegacyWidth) {
    db.exec(`UPDATE projects SET road_width = COALESCE(road_width, width, 0) WHERE road_width IS NULL OR road_width = 0`);
  }

  db.exec(`
    UPDATE projects SET status = 'OPEN_FOR_BIDDING' WHERE status IN ('PLANNED', 'ACTIVE', 'FAILED', 'ONGOING');
    UPDATE projects SET status = 'IN_PROGRESS' WHERE contractor_id IS NOT NULL AND status = 'OPEN_FOR_BIDDING';
  `);

  seedDemoUsers();
  seedDemoData();
}

export { uploadDir };
export default db;
