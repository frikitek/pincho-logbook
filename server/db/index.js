// Relax TLS verification for serverless environment with Supabase pooler
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For serverless environments + Supabase pooler, enforce TLS but ignore self-signed chain
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

// Función para ejecutar queries
const query = (text, params) => pool.query(text, params);

// Función para obtener una conexión del pool
const getClient = () => pool.connect();

// Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    // Verificar conexión
    const result = await query('SELECT NOW()');
    console.log('✅ Base de datos conectada:', result.rows[0].now);
    
    // Verificar si las tablas existen
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'categorias', 'pinchos', 'valoraciones')
    `);
    
    console.log('📋 Tablas encontradas:', tablesResult.rows.map(row => row.table_name));
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
};

// Función para cerrar el pool de conexiones
const closePool = () => {
  pool.end();
};

module.exports = {
  query,
  getClient,
  initDatabase,
  closePool
};
