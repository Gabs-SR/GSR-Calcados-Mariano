const express = require('express');
const ProdutoController = require('../controllers/ProdutoController');
const { exigirSessao } = require('../middlewares/autenticacao');

const router = express.Router();

router.get('/produtos/buscar', ProdutoController.buscarProdutos);
router.get('/produtos/categorias', ProdutoController.listarOpcoesDeFiltro);
router.get('/produtos', ProdutoController.listarProdutos);
router.get('/produtos/:id', ProdutoController.mostrarProduto);
router.post('/produtos', exigirSessao, ProdutoController.adicionarProduto);
router.put('/produtos/:id', exigirSessao, ProdutoController.atualizarProduto);
router.delete('/produtos/:id', exigirSessao, ProdutoController.removerProduto);

module.exports = router;
