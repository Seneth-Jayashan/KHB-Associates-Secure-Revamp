const express = require('express');
const router = express.Router();

const StockController = require('../controller/stock'); 
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', StockController.getStock);
router.get('/stock', StockController.getStockByProductId);
router.get('/stockbyname', StockController.getStockByName)
router.post('/addstock', authMiddleware(['admin', 'inventory_manager']), StockController.addStock);
router.delete('/deletestock', authMiddleware(['admin', 'inventory_manager']), StockController.deleteStock);

module.exports = router;
