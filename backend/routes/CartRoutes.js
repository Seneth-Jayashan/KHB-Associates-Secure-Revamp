const express = require('express');
const router = express.Router();

const CartController = require('../controller/cart');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/addtocart',authMiddleware(['customer']), CartController.addToCart);
// CWE-639: every cart route requires a customer JWT; the cart owner is req.user.id
router.get('/getcart/:user_id', authMiddleware(['customer']), CartController.getCart);
router.put('/updatecartitem', authMiddleware(['customer']), CartController.updateCartItem);
router.put('/updatetotalprice', authMiddleware(['customer']), CartController.updateTotalPrice);
router.delete('/removefromcart', authMiddleware(['customer']), CartController.removeFromCart);
router.delete('/clearcart/:id', authMiddleware(['customer']), CartController.clearCart);


module.exports = router;
