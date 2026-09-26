const express = require('express');
const router = express.Router();

const StockController = require('../controller/stock'); 

router.get('/', StockController.getStock);
router.get('/stock', StockController.getStockByProductId);
router.get('/stockbyname', StockController.getStockByName)
router.post('/addstock', StockController.addStock);
router.delete('/deletestock', StockController.deleteStock);

module.exports = router;
