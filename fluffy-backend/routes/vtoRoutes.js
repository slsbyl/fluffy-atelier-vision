const express = require('express');
const container = require('../container');

const vtoController = container.resolve('VTOController');
const router = express.Router();

router.post('/', vtoController.tryOn);

module.exports = router;
