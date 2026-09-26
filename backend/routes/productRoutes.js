const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const ProductController = require('../controller/product'); 

router.get('/', ProductController.getProducts);  
router.get('/product', ProductController.getProductById); 
router.get('/productbycategory',ProductController.getProductByCategoryId);
router.get('/productbybrand',ProductController.getProductByBrandId);
router.get('/productid', ProductController.getProductId);
router.post('/addproduct', upload.single("product_image"), ProductController.addProduct); 
router.put('/updateproduct', upload.single("product_image"), ProductController.updateProduct);
router.put('/stockupdate',ProductController.reduceProductStock);

router.delete('/deleteproduct', ProductController.deleteProduct); 
router.delete('/deleteproductcategory',ProductController.deleteProductbyCategory);
router.delete('/deleteproductbrand', ProductController.deleteProductbyBrand);

module.exports = router;
