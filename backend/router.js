const express = require("express");
const router = express.Router();


const brandRoutes = require("./routes/brandRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cutomerRoutes = require("./routes/customerRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/inventoryManagerRoutes');
const deliverRoutes = require('./routes/deliverRoutes');
const supporterRoutes = require('./routes/customerSupportRoutes');
const salary = require('./routes/salaryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/CartRoutes');
const contactrouter = require('./routes/contactroute');
const ticketRouter = require('./routes/ticketroute');
const chatRouter = require('./routes/chatRoute');
const reportRouter = require('./routes/reportRoutes');
const notification = require('./routes/notificationRoutes');
const promoCodeRoutes = require('./routes/PromoCodeRoutes');
const gameRoutes = require('./routes/gameRoutes');

router.use("/brands", brandRoutes); 
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/stocks", stockRoutes);
router.use("/reports", reportRouter);
router.use("/customers", cutomerRoutes);
router.use("/users", userRoutes);
router.use("/admins", adminRoutes);
router.use("/managers", managerRoutes);
router.use("/delivers", deliverRoutes);
router.use("/supporters", supporterRoutes);
router.use("/salary", salary);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/contact", contactrouter);
router.use("/tickets", ticketRouter);
router.use("/chats", chatRouter);
router.use("/notifications", notification);
router.use("/promo", promoCodeRoutes);  
router.use("/game", gameRoutes);   


module.exports = router;
