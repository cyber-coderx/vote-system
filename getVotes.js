import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests are allowed' });
        return;
    }

    await client.connect();

    // Get vote counts
    const result = await client.query('SELECT candidate, COUNT(*) as count FROM votes GROUP BY candidate');
    const votes = result.rows.reduce((acc, row) => {
        acc[row.candidate] = row.count;
        return acc;
    }, {});

    await client.end();

    res.status(200).json({ votes });
};
