const express = require("express");
const router = express.Router();
const promoCodeController = require("../controller/PromoCode");
const authMiddleware = require('../middleware/authMiddleware');

router.get("/auto-generate", authMiddleware(['admin']), promoCodeController.autoGeneratePromo);

router.post("/validate", promoCodeController.validatePromo);

router.get("/get", authMiddleware(['admin']), promoCodeController.getAllPromos);

router.delete("/delete/:code", authMiddleware(['admin']), promoCodeController.deletePromo);

module.exports = router;
