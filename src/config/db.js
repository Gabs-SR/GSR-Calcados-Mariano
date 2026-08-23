const { Pool } = require('pg');
const { carregarAmbiente } = require('./ambiente');

carregarAmbiente();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não foi definida. Configure a conexão PostgreSQL/Supabase.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT) || 10000
});

pool.on('error', (erro) => {
    console.error('Erro inesperado no pool PostgreSQL:', erro);
});

const query = (texto, parametros = []) => pool.query(texto, parametros);

const buscarUm = async (texto, parametros = []) => {
    const resultado = await pool.query(texto, parametros);
    return resultado.rows[0] || null;
};

const buscarTodos = async (texto, parametros = []) => {
    const resultado = await pool.query(texto, parametros);
    return resultado.rows;
};

const verificarConexao = async () => {
    await pool.query('SELECT 1');
    return true;
};

module.exports = { pool, query, buscarUm, buscarTodos, verificarConexao };
