const express = require('express');
const container = require('../container');

const clientController = container.resolve('ClientController');
const router = express.Router();

router.route('/')
  .get(clientController.getAllClients)
  .post(clientController.createClient);

router.route('/:id')
  .get(clientController.getClient)
  .patch(clientController.updateClient)
  .delete(clientController.deleteClient);

module.exports = router;
