const cron = require('node-cron');
const Product = require('../model/product');
const Brand = require('../model/brand');
const Category = require('../model/category');
const { sendLowStockNotify } = require('./mailer');

const LOW_STOCK_THRESHOLD = 100;

cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('Running low stock check...');
    const lowStockProducts = await Product.find({ stock_count: { $lt: LOW_STOCK_THRESHOLD } });

    if (lowStockProducts.length === 0) {
      console.log('No low stock products found.');
      return;
    }

    for (const product of lowStockProducts) {
      const b = await Brand.findOne({brand_id:product.product_brand_id});
      const c = await Category.findOne({category_id:product.product_category_id});
      await sendLowStockNotify(
        product.product_name,
        b.brand_name,
        c.category_name,
        product.stock_count
      );
    }

    console.log(`Notifications sent for ${lowStockProducts.length} low stock products.`);
  } catch (error) {
    console.error('Error during low stock check:', error);
  }
});
