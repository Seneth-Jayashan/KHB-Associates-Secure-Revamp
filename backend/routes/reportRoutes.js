const express = require('express');
const router = express.Router();
const stockController = require('../controller/report');

router.get('/report', stockController.getStockReport);

module.exports = router;
