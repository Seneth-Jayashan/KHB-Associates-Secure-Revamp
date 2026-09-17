const PromoCode = require("../model/PromoCode");

// Auto-generate a promo code
exports.autoGeneratePromo = async (req, res) => {
  try {
    // Check if a valid promo already exists
    const existing = await PromoCode.findOne({ isActive: true });
    if (existing) return res.json(existing);

    const code = `KHB${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000) * 14); // expires in 14 day

    const newPromo = new PromoCode({ code, expiresAt });
    await newPromo.save();

    res.status(201).json(newPromo);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate promo code." });
  }
};

// Validate a promo code
exports.validatePromo = async (req, res) => {
  try {
    const { code } = req.body;
    const promo = await PromoCode.findOne({ code, isActive: true });

    if (!promo) return res.status(404).json({ valid: false, message: "Invalid promo code" });
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      promo.isActive = false;
      await promo.save();
      return res.status(400).json({ valid: false, message: "Promo code expired" });
    }

    res.json({ valid: true, discountValue: promo.discountValue });
  } catch (err) {
    res.status(500).json({ valid: false, message: "Error validating promo code" });
  }
};

// Delete a promo code
exports.deletePromo = async (req, res) => {
  try {
    const { code } = req.params;

    const deletedPromo = await PromoCode.findOneAndDelete({ code });

    if (!deletedPromo) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    res.json({ message: "Promo code deleted successfully", deletedPromo });
  } catch (err) {
    res.status(500).json({ message: "Error deleting promo code" });
  }
};

// Get all promo codes
exports.getAllPromos = async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching promo codes" });
  }
};
