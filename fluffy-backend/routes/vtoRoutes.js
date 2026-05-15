const express = require('express');
const vtoController = require('../controllers/vtoController');

const router = express.Router();

router.post('/', vtoController.tryOn);

module.exports = router;