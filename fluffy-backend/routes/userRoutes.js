const express = require('express');
const container = require('../container');

const authController = container.resolve('AuthController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;
