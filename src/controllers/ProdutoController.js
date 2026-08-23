const { ProdutoModel } = require('../models/ProdutoModel');

const responderErro = (res, erro, mensagem) => {
    if (erro.validacao) return res.status(400).json({ mensagem: erro.message, erros: erro.erros || [] });
    if (erro.naoEncontrado) return res.status(404).json({ mensagem: erro.message });
    console.error(erro);
    return res.status(500).json({ mensagem });
};

const ProdutoController = {
    listarProdutos: async (req, res) => {
        try { return res.json(await ProdutoModel.listar(req.query)); }
        catch (erro) { return responderErro(res, erro, 'Erro interno ao buscar os produtos.'); }
    },

    listarOpcoesDeFiltro: async (req, res) => {
        try { return res.json(await ProdutoModel.opcoesDeFiltro()); }
        catch (erro) { return responderErro(res, erro, 'Erro interno ao buscar as opções.'); }
    },

    mostrarProduto: async (req, res) => {
        try { return res.json(await ProdutoModel.porId(req.params.id)); }
        catch (erro) { return responderErro(res, erro, 'Erro interno ao buscar o produto.'); }
    },

    adicionarProduto: async (req, res) => {
        try { return res.status(201).json({ mensagem: 'Produto adicionado com sucesso!', ...(await ProdutoModel.adicionar(req.body)) }); }
        catch (erro) { return responderErro(res, erro, 'Erro ao salvar o produto no banco.'); }
    },

    atualizarProduto: async (req, res) => {
        try { return res.json({ mensagem: 'Produto atualizado.', ...(await ProdutoModel.atualizar(req.params.id, req.body)) }); }
        catch (erro) { return responderErro(res, erro, 'Erro ao atualizar o produto.'); }
    },

    removerProduto: async (req, res) => {
        try { return res.json({ mensagem: 'Produto removido.', ...(await ProdutoModel.remover(req.params.id)) }); }
        catch (erro) { return responderErro(res, erro, 'Erro ao remover o produto.'); }
    },

    buscarProdutos: async (req, res) => {
        try { return res.json(await ProdutoModel.buscar(req.query.termo, req.query.tipo)); }
        catch (erro) { return responderErro(res, erro, 'Erro ao pesquisar os produtos.'); }
    }
};

module.exports = ProdutoController;
