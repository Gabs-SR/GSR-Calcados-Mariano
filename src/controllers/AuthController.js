const { autenticacaoConfigurada, senhaConfere, criarToken, gravarCookieDeSessao, limparCookieDeSessao, temSessao } = require('../auth/sessao');

const AuthController = {
    login: (req, res) => {
        if (!autenticacaoConfigurada()) return res.status(503).json({ mensagem: 'Autenticação não configurada no servidor.' });
        if (!senhaConfere(req.body?.senha, process.env.ADMIN_SENHA_HASH)) return res.status(401).json({ mensagem: 'Senha inválida.' });
        gravarCookieDeSessao(res, criarToken());
        return res.json({ autenticado: true });
    },
    logout: (req, res) => {
        limparCookieDeSessao(res);
        return res.json({ autenticado: false });
    },
    sessao: (req, res) => res.json({ autenticado: temSessao(req) })
};

module.exports = AuthController;
