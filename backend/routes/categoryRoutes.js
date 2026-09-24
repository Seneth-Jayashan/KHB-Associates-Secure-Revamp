const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const CategoryController = require('../controller/category'); 

router.get('/', CategoryController.getCategories);  
router.get('/category', CategoryController.getCategoryById); 
router.get('/categorybybrand',CategoryController.getCategoryByBrandId);
router.post('/addcategory', authMiddleware(['admin', 'inventory_manager']), upload.single("category_image"), CategoryController.addCategory); 
router.put('/updatecategory', authMiddleware(['admin', 'inventory_manager']), upload.single("category_image"), CategoryController.updateCategory);
router.put('/updateprocount', authMiddleware(['admin', 'inventory_manager']), CategoryController.updateCategoryProductCount);
router.delete('/deletecategory', authMiddleware(['admin', 'inventory_manager']), CategoryController.deleteCategory); 
router.delete('/deletebrandscategory', authMiddleware(['admin', 'inventory_manager']), CategoryController.deleteCategorybyBrand);

module.exports = router;
