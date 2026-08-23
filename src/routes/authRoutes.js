const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.get('/auth/sessao', AuthController.sessao);

module.exports = router;
