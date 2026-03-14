-- Create database
-- CREATE DATABASE infratrust_db;
-- \c infratrust_db;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'CONTRACTOR', 'DRIVER', 'CITIZEN')),
    truck_plate VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_lat DECIMAL(10, 8) NOT NULL,
    start_lng DECIMAL(11, 8) NOT NULL,
    end_lat DECIMAL(10, 8) NOT NULL,
    end_lng DECIMAL(11, 8) NOT NULL,
    soil_type VARCHAR(100) NOT NULL,
    road_type VARCHAR(100) NOT NULL,
    length DECIMAL(10, 2) NOT NULL,
    width DECIMAL(10, 2) NOT NULL,
    contractor_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boq (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    bitumen DECIMAL(10, 2) NOT NULL,
    aggregate DECIMAL(10, 2) NOT NULL,
    cement DECIMAL(10, 2) NOT NULL,
    sand DECIMAL(10, 2) NOT NULL,
    estimated_cost DECIMAL(15, 2) NOT NULL,
    locked BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS material_passports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    material_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    factory_name VARCHAR(255) NOT NULL,
    truck_id INTEGER REFERENCES users(id),
    dispatch_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qr_code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DISPATCHED' CHECK (status IN ('DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'VERIFIED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS truck_tracking (
    id SERIAL PRIMARY KEY,
    truck_id INTEGER REFERENCES users(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trust_scores (
    contractor_id INTEGER PRIMARY KEY REFERENCES users(id),
    score INTEGER DEFAULT 100,
    projects_completed INTEGER DEFAULT 0,
    complaints INTEGER DEFAULT 0,
    delivery_issues INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example inserts for testing
-- The password for both is 'password123'
-- bcrypt hash for 'password123' with 10 rounds: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQ68YIGy

INSERT INTO users (name, email, phone, password_hash, role, truck_plate)
VALUES 
    ('System Admin', 'admin@infratrust.com', '+10000000000', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQ68YIGy', 'ADMIN', NULL),
    ('Main Contractor', 'contractor@infratrust.com', '+10000000001', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQ68YIGy', 'CONTRACTOR', NULL)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS material_requests (
    id TEXT PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    contractor_id INTEGER REFERENCES users(id),
    material_type TEXT NOT NULL,
    quantity REAL NOT NULL,
    requested_date TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    passport_id INTEGER REFERENCES material_passports(id),
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contractor_scores (
    contractor_id INTEGER PRIMARY KEY REFERENCES users(id),
    score INTEGER DEFAULT 100,
    projects_completed INTEGER DEFAULT 0,
    complaints INTEGER DEFAULT 0,
    delivery_issues INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

