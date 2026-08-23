const express = require('express');
const ProdutoController = require('../controllers/ProdutoController');

const router = express.Router();

// A rota de busca vem antes de /produtos/:id para nunca ser interpretada como id.
router.get('/produtos/buscar', ProdutoController.buscarProdutos);
router.get('/produtos/categorias', ProdutoController.listarOpcoesDeFiltro);
router.get('/produtos', ProdutoController.listarProdutos);
router.get('/produtos/:id', ProdutoController.mostrarProduto);
router.post('/produtos', ProdutoController.adicionarProduto);
router.put('/produtos/:id', ProdutoController.atualizarProduto);
router.delete('/produtos/:id', ProdutoController.removerProduto);

module.exports = router;
