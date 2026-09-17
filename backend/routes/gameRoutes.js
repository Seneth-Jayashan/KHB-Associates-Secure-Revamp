const express = require('express');
const router = express.Router();

const gameController = require('../controller/game'); // Make sure the path is correct

// Define your routes
router.post('/add', gameController.addPoint); 
router.post('/redeem',gameController.redeem);

// Export the router instance
module.exports = router;
