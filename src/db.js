import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  DEV: dev = false,
} = process.env;

const connectionOptions = { connectionString };

if (!dev) {
  connectionOptions.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new pg.Pool(connectionOptions);

pool.on('error', (err, client) => { // eslint-disable-line
  console.error('Unexpected error on idle client', err); // eslint-disable-line
  process.exit(-1);
});

export const sign = async (signature) => {
  const client = await pool.connect();
  const query = 'insert into signatures(name, nationalId, comment, anonymous) values($1, $2, $3, $4) returning *;';
  try {
    await client.query(query, signature);
  } catch (e) {
    if (e.code === '23505' && e.constraint === 'signatures_nationalid_key') {
      return -1;
    }
    console.error('Error selecting', e.code);
  } finally {
    client.release();
  }
  return 0;
};

export async function getSignatures() {
  const client = await pool.connect();
  const query = 'select * from signatures;';
  let rows = [];
  try {
    const result = await client.query(query);
    rows = result.rows;
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }
  return rows;
}
