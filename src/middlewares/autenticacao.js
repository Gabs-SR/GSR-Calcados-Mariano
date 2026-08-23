const { temSessao } = require('../auth/sessao');

const exigirSessao = (req, res, next) => {
    if (!temSessao(req)) return res.status(401).json({ mensagem: 'Autenticação necessária.' });
    return next();
};

module.exports = { exigirSessao };
