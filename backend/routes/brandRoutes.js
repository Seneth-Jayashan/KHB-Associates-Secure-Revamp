const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const BrandController = require('../controller/brand'); 

router.get('/', BrandController.getBrands);
router.get('/brand', BrandController.getBrandById);
router.post('/addbrand', authMiddleware(['admin', 'inventory_manager']), upload.single("brand_image"), BrandController.addBrand);
router.put('/updatebrand', authMiddleware(['admin', 'inventory_manager']), upload.single("brand_image"), BrandController.updateBrand);
router.put('/updatecatcount', authMiddleware(['admin', 'inventory_manager']), BrandController.updateCategoryCount);
router.delete('/deletebrand', authMiddleware(['admin', 'inventory_manager']), BrandController.deleteBrand);

module.exports = router;
