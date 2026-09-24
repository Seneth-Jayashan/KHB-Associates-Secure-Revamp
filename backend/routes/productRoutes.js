const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const ProductController = require('../controller/product'); 

router.get('/', ProductController.getProducts);  
router.get('/product', ProductController.getProductById); 
router.get('/productbycategory',ProductController.getProductByCategoryId);
router.get('/productbybrand',ProductController.getProductByBrandId);
router.get('/productid', ProductController.getProductId);
router.post('/addproduct', authMiddleware(['admin', 'inventory_manager']), upload.single("product_image"), ProductController.addProduct); 
router.put('/updateproduct', authMiddleware(['admin', 'inventory_manager']), upload.single("product_image"), ProductController.updateProduct);
router.put('/stockupdate', authMiddleware(['admin', 'inventory_manager']), ProductController.reduceProductStock);

router.delete('/deleteproduct', authMiddleware(['admin', 'inventory_manager']), ProductController.deleteProduct); 
router.delete('/deleteproductcategory', authMiddleware(['admin', 'inventory_manager']), ProductController.deleteProductbyCategory);
router.delete('/deleteproductbrand', authMiddleware(['admin', 'inventory_manager']), ProductController.deleteProductbyBrand);

module.exports = router;
