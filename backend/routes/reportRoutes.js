const express = require('express');
const router = express.Router();
const stockController = require('../controller/report');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/report', authMiddleware(['admin', 'inventory_manager']), stockController.getStockReport);

module.exports = router;
