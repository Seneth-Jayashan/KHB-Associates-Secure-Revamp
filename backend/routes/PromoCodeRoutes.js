const express = require("express");
const router = express.Router();
const promoCodeController = require("../controller/PromoCode");

router.get("/auto-generate", promoCodeController.autoGeneratePromo);

router.post("/validate", promoCodeController.validatePromo);

router.get("/get", promoCodeController.getAllPromos);

router.delete("/delete/:code", promoCodeController.deletePromo);

module.exports = router;
