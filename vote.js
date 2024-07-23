import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests are allowed' });
        return;
    }

    const { candidate } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        await pool.connect();

        // Check if IP address has already voted
        const checkVote = await pool.query('SELECT * FROM votes WHERE ip_address = $1', [ipAddress]);
        if (checkVote.rows.length > 0) {
            res.status(403).json({ success: false, message: 'Already voted' });
            return;
        }

        // Insert vote and IP address into database
        await pool.query('INSERT INTO votes (candidate, ip_address) VALUES ($1, $2)', [candidate, ipAddress]);

        // Get updated vote counts
        const result = await pool.query('SELECT candidate, COUNT(*) as count FROM votes GROUP BY candidate');
        const votes = result.rows.reduce((acc, row) => {
            acc[row.candidate] = row.count;
            return acc;
        }, {});

        res.status(200).json({ success: true, votes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        await pool.end();
    }
};
