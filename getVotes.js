import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests are allowed' });
        return;
    }

    try {
        await pool.connect();

        // Get vote counts
        const result = await pool.query('SELECT candidate, COUNT(*) as count FROM votes GROUP BY candidate');
        const votes = result.rows.reduce((acc, row) => {
            acc[row.candidate] = row.count;
            return acc;
        }, {});

        res.status(200).json({ votes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        await pool.end();
    }
};
