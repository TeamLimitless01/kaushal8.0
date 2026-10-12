const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!match) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}
const pool = new Pool({ connectionString: match[1] });

async function fixCredentials() {
  try {
    const adminHash = await bcrypt.hash('admin', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    // Update admin
    await pool.query(
      `UPDATE users SET "passwordHash" = $1, role = 'ADMIN', name = 'Campus Administrator' WHERE email = 'admin@svvv.in'`,
      [adminHash]
    );

    // Update or insert student
    await pool.query(
      `UPDATE users SET "passwordHash" = $1, role = 'STUDENT', name = 'Aarav Sharma (Student Ambassador)' WHERE email = 'student@svvv.in'`,
      [studentHash]
    );

    // Remove any user with non-standard roles or non-existent email if any
    await pool.query(`DELETE FROM users WHERE email NOT IN ('admin@svvv.in', 'student@svvv.in')`);

    const users = await pool.query('SELECT email, role, name FROM users');
    console.log('Confirmed accounts in DB:', users.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixCredentials();
