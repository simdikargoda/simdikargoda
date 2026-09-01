const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres' });
async function run() {
  await pool.query(`CREATE TABLE IF NOT EXISTS security_audit_logs ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, action TEXT NOT NULL, ip_address TEXT, user_agent TEXT, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() );`);
  await pool.query(`CREATE INDEX IF NOT EXISTS security_audit_logs_user_id_idx ON security_audit_logs(user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS security_audit_logs_action_idx ON security_audit_logs(action);`);
  console.log('Success');
  process.exit(0);
}
run();
