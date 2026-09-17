const cron = require('node-cron');
const Order = require('../model/order');
const User = require('../model/user');
const { assignDeliver } = require('../controller/deliver');
const { sendDeliveryToDeliver } = require('./mailer');


cron.schedule('* * * * *', async () => {
  try {
    console.log('Running order status check...');

    const orderCheck = await Order.find({ status: 'processing' });

    if (orderCheck.length === 0) {
      console.log('No orders to deliver.');
      return;
    }

    for (const order of orderCheck) {
      try {
        order.status = "shipped";
        await order.save();
        const delivery = await assignDeliver(
          order.order_id,
          order.user_id,
          order.shipping_address
        );

        if (delivery && delivery.deliver_id) {
          const user = await User.findOne({ user_id: delivery.deliver_id });

          if (user) {
            sendDeliveryToDeliver(user.email);
            console.log(`Order ${order.order_id} assigned to deliver: ${user.firstName} ${user.lastName}`);
          } else {
            console.log(`Deliver not found for ID: ${delivery.deliver_id}`);
          }
        } else {
          console.log(`Failed to assign deliver for order: ${order.order_id}`);
        }
      } catch (err) {
        console.error(`Error in order assignment for order ${order.order_id}:`, err.message);
      }
    }
  } catch (error) {
    console.error("Error during order status check:", error.message);
  }
});
