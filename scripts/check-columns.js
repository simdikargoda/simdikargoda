import pg from 'pg';

const { Client } = pg;

async function checkColumns() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  });

  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sessions';
    `);
    
    console.log(res.rows);
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkColumns();
