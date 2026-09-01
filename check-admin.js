const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DIRECT_URL });
async function run() {
  await client.connect();
  const res = await client.query(`SELECT id, email, password_hash, role, status FROM users WHERE email = 'ozan.forum@hotmail.com';`);
  console.log(res.rows);
  await client.end();
}
run().catch(console.error);
