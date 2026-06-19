require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO usuarios (nombre, email, contrasena, rol)
       VALUES ($1, $2, crypt($3, gen_salt('bf')), $4)
       ON CONFLICT (email) DO NOTHING`,
      ['Administrador', 'admin@flacuchos.org', adminPassword, 'admin']
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante el seed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
