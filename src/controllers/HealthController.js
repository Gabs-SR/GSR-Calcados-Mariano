const HealthModel = require('../models/HealthModel');

const HealthController = {
    verificar: async (req, res) => {
        try {
            const produtos = await HealthModel.verificar();
            return res.json({ status: 'ok', banco: 'conectado', produtos });
        } catch (erro) {
            console.error('Health check falhou:', erro.message);
            return res.status(503).json({ status: 'erro', banco: 'indisponivel' });
        }
    }
};

module.exports = HealthController;
