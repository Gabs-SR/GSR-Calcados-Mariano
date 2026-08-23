const express = require('express');
const cors = require('cors');
const { carregarAmbiente } = require('./config/ambiente');
const produtoRoutes = require('./routes/produtoRoutes');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');

carregarAmbiente();
require('./config/db');

const app = express();

const origens = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((valor) => valor.trim())
    .filter(Boolean);

app.use(cors({
    origin: origens.length ? origens : true,
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.type('text').send('Calçados Mariano API'));
app.use(healthRoutes);
app.use(authRoutes);
app.use(produtoRoutes);

app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));

app.use((erro, req, res, next) => {
    console.error('Erro não tratado:', erro);
    if (res.headersSent) return next(erro);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

module.exports = app;
