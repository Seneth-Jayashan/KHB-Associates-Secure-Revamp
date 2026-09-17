const Stock = require("../model/stock");

exports.getStockReport = async (req, res) => {
  try {
    const report = await Stock.aggregate([
      {
        $group: {
          _id: "$product_id",
          product_name: { $first: "$product_name" },
          brand_id: { $first: "$brand_id" },
          category_id: { $first: "$category_id" },
          totalAdded: {
            $sum: {
              $cond: [{ $eq: ["$type", "add"] }, "$quantity", 0]
            }
          },
          totalRemoved: {
            $sum: {
              $cond: [{ $eq: ["$type", "remove"] }, "$quantity", 0]
            }
          },
          totalSold: {
            $sum: {
              $cond: [{ $eq: ["$type", "sold"] }, "$quantity", 0]
            }
          }
        }
      }
    ]);
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
};
