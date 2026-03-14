const db = require('../db/db');

class BoqModel {
  static async createBoq(boqData, client = db) {
    const {
      project_id, bitumen, aggregate, cement, sand, estimated_cost
    } = boqData;

    const query = `
      INSERT INTO boq (
        project_id, bitumen, aggregate, cement, sand, estimated_cost, locked
      )
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *;
    `;

    const values = [
      project_id, bitumen, aggregate, cement, sand, estimated_cost
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async findByProjectId(projectId) {
    const query = `
      SELECT * FROM boq WHERE project_id = $1;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows[0];
  }
}

module.exports = BoqModel;
