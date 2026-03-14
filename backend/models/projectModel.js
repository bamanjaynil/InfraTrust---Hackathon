const db = require('../db/db');

class ProjectModel {
  static async createProject(projectData, client = db) {
    const {
      name, start_lat, start_lng, end_lat, end_lng,
      soil_type, road_type, length, width, contractor_id,
      state, district, city
    } = projectData;

    const query = `
      INSERT INTO projects (
        name, start_lat, start_lng, end_lat, end_lng,
        soil_type, road_type, length, width, contractor_id, status,
        state, district, city
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PLANNED', $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      name, start_lat, start_lng, end_lat, end_lng,
      soil_type, road_type, length, width, contractor_id,
      state || null, district || null, city || null
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT p.*, u.name as contractor_name 
      FROM projects p
      LEFT JOIN users u ON p.contractor_id = u.id
      ORDER BY p.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async findByContractorId(contractorId) {
    const query = `
      SELECT p.*, u.name as contractor_name 
      FROM projects p
      LEFT JOIN users u ON p.contractor_id = u.id
      WHERE p.contractor_id = $1
      ORDER BY p.created_at DESC;
    `;
    const result = await db.query(query, [contractorId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.name as contractor_name 
      FROM projects p
      LEFT JOIN users u ON p.contractor_id = u.id
      WHERE p.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE projects
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  static async findByArea(district, city) {
    const query = `
      SELECT p.*, u.name as contractor_name 
      FROM projects p
      LEFT JOIN users u ON p.contractor_id = u.id
      WHERE p.district = $1 OR p.city = $2
      ORDER BY p.created_at DESC;
    `;
    const result = await db.query(query, [district, city]);
    return result.rows;
  }

  static async findNearby(lat, lng, radiusKm = 20) {
    // Haversine formula for distance
    const query = `
      SELECT p.*, u.name as contractor_name,
      (
        6371 * acos(
          cos(radians($1)) * cos(radians(p.start_lat)) *
          cos(radians(p.start_lng) - radians($2)) +
          sin(radians($1)) * sin(radians(p.start_lat))
        )
      ) AS distance
      FROM projects p
      LEFT JOIN users u ON p.contractor_id = u.id
      WHERE (
        6371 * acos(
          cos(radians($1)) * cos(radians(p.start_lat)) *
          cos(radians(p.start_lng) - radians($2)) +
          sin(radians($1)) * sin(radians(p.start_lat))
        )
      ) <= $3
      ORDER BY distance ASC;
    `;
    const result = await db.query(query, [lat, lng, radiusKm]);
    return result.rows;
  }
}

module.exports = ProjectModel;
