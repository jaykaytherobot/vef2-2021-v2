import pg from 'pg';
const connectionString = 'postgres://vef1:vefforritun@localhost/v2';

const pool= new pg.Pool({ connectionString });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const sign = async (signature) => {
  const client = await pool.connect();
  const query = 'insert into signatures(name, nationalId, comment, anonymous) values($1, $2, $3, $4) returning *;';
  try {
    const result = await client.query(query, signature);
    console.log('rows :>>', result.rows);
  }
  catch (e) {
    console.error('Error selecting', e);
  }
  finally {
    client.release();
  }
}

export async function getSignatures() {
  const client = await pool.connect();
  const query = 'select * from signatures;';
  let rows = [];
  try {
    const result = await client.query(query);
    rows = result.rows;
  }
  catch (e) {
    console.error('Error selecting', e);
  }
  finally {
    client.release();
  }
  return rows;
}