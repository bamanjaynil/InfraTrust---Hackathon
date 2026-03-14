import { Request, Response } from 'express';
import db from '../db.js';

export const getTrustScores = (req: Request, res: Response) => {
  const scores = db.prepare('SELECT * FROM trust_scores').all();
  res.json({ status: 'success', data: scores });
};
