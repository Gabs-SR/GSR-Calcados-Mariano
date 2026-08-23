const db = require('../config/db');

const HealthModel = {
    verificar: async () => {
        await db.verificarConexao();
        const resultado = await db.buscarUm('SELECT COUNT(*)::int AS total FROM produtos', []);
        return Number(resultado.total);
    }
};

module.exports = HealthModel;
