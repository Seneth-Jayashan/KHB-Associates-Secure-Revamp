const Cart = require('../model/Cart');
const Product = require('../model/product');

// --- Authorization helper (CWE-639) ---
// The cart owner is always the authenticated user (req.user.id from the JWT).
// If the client also supplies a user id, it must match the token or the request is rejected.
const isNotOwner = (req, suppliedId) =>
    suppliedId !== undefined && suppliedId !== null && Number(suppliedId) !== Number(req.user.id);
const FORBIDDEN = { message: 'Access denied. You do not have permission' };

// Add item to cart
exports.addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    try {
        const product = await Product.findOne({ product_id });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let cart = await Cart.findOne({ user_id });
        if (!cart) cart = new Cart({ user_id, items: [] });

        const existingItem = cart.items.find(item => item.product_id.toString() === product_id.toString());
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product_id, quantity });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get cart by user ID
exports.getCart = async (req, res) => {
    if (isNotOwner(req, req.params.user_id)) return res.status(403).json(FORBIDDEN);
    const user_id = req.user.id;
    try {
        let cart = await Cart.findOne({ user_id });
        if (!cart) {
            cart = new Cart({ user_id, items: [], total_price: 0 });
            await cart.save();
        }
        res.status(200).json(cart);
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    const { product_id, quantity } = req.body;
    if (isNotOwner(req, req.body.user_id)) return res.status(403).json(FORBIDDEN);
    const user_id = req.user.id;
    try {
        const cart = await Cart.findOne({ user_id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.find(item => item.product_id.toString() === product_id.toString());
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        item.quantity = quantity;
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update total price
exports.updateTotalPrice = async (req, res) => {
    const { total_price } = req.body;
    if (isNotOwner(req, req.body.user_id)) return res.status(403).json(FORBIDDEN);
    const user_id = req.user.id;
    try {
        const cart = await Cart.findOne({ user_id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.total_price = total_price;
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Remove item
exports.removeFromCart = async (req, res) => {
    const { product_id } = req.body;
    if (isNotOwner(req, req.body.user_id)) return res.status(403).json(FORBIDDEN);
    const user_id = req.user.id;
    try {
        const cart = await Cart.findOne({ user_id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.product_id.toString() !== product_id.toString());
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    if (isNotOwner(req, req.params.id)) return res.status(403).json(FORBIDDEN);
    const user_id = req.user.id;
    try {
        await Cart.findOneAndDelete({ user_id });
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
