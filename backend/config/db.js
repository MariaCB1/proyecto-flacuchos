const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('✅ Conexión a PostgreSQL establecida');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión:', err.message);
});

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('📊 Query ejecutada:', { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
};

const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);

  const timeout = setTimeout(() => {
    console.error('⚠️ Client has been checked out for too long');
  }, 5000);

  client.query = (...args) => {
    clearTimeout(timeout);
    return originalQuery(...args);
  };

  client.release = () => {
    clearTimeout(timeout);
    return release();
  };

  return client;
};

module.exports = {
  query,
  getClient,
  pool,
};