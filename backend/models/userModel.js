const db = require('../db/db');

class UserModel {
  static async createUser({ name, email, phone, password_hash, role, truck_plate, state, district, city, pincode, latitude, longitude }) {
    const query = `
      INSERT INTO users (name, email, phone, password_hash, role, truck_plate, state, district, city, pincode, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, name, email, phone, role, truck_plate, state, district, city, pincode, latitude, longitude, created_at;
    `;
    const values = [
      name, 
      email || null, 
      phone || null, 
      password_hash, 
      role, 
      truck_plate || null,
      state || null,
      district || null,
      city || null,
      pincode || null,
      latitude || null,
      longitude || null
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByIdentifier(identifier) {
    const query = `
      SELECT * FROM users
      WHERE email = $1 OR phone = $1;
    `;
    const { rows } = await db.query(query, [identifier]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, name, email, phone, role, truck_plate, state, district, city, pincode, latitude, longitude, created_at
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByRole(role) {
    const query = `
      SELECT id, name, email, phone, role, created_at
      FROM users
      WHERE role = $1
      ORDER BY name ASC;
    `;
    const { rows } = await db.query(query, [role]);
    return rows;
  }
}

module.exports = UserModel;
