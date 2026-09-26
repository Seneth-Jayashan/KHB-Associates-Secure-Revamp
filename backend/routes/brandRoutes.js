const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const BrandController = require('../controller/brand'); 

router.get('/', BrandController.getBrands);
router.get('/brand', BrandController.getBrandById);
router.post('/addbrand', upload.single("brand_image"), BrandController.addBrand);
router.put('/updatebrand',upload.single("brand_image"), BrandController.updateBrand);
router.put('/updatecatcount',BrandController.updateCategoryCount);
router.delete('/deletebrand', BrandController.deleteBrand);

module.exports = router;
