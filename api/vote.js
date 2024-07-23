import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests are allowed' });
        return;
    }

    const { candidate } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await client.connect();

    // Check if IP address has already voted
    const checkVote = await client.query('SELECT * FROM votes WHERE ip_address = $1', [ipAddress]);
    if (checkVote.rows.length > 0) {
        res.status(403).json({ success: false, message: 'Already voted' });
        await client.end();
        return;
    }

    // Insert vote and IP address into database
    await client.query('INSERT INTO votes (candidate, ip_address) VALUES ($1, $2)', [candidate, ipAddress]);

    // Get updated vote counts
    const result = await client.query('SELECT candidate, COUNT(*) as count FROM votes GROUP BY candidate');
    const votes = result.rows.reduce((acc, row) => {
        acc[row.candidate] = row.count;
        return acc;
    }, {});

    await client.end();

    res.status(200).json({ success: true, votes });
};
