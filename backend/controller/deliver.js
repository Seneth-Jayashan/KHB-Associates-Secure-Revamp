const Deliver = require('../model/user');
const DeliverStats = require('../model/deliverStats');
const Delivery = require('../model/delivery');
const Order = require('../model/order');

const bcrypt = require('bcryptjs'); 
const emailSender = require('../utils/mailer');
const jwt = require("jsonwebtoken");
const pdfDocument = require('pdfkit'); 


require("dotenv").config();

exports.getDeliver = async(req,res) => {
    try {
        const delivers = await Deliver.find({role: "deliver"});
        if(!delivers) {
            return res.status(404).json({message: "No delivers found"});
        }
        res.status(200).json(delivers);
    }catch (error) {
        res.status(500).json({message: "Error fetching delivers"});
    }
}

exports.getDeliverById = async(req, res) => {
    try {
        const id = req.query.id;
        const deliver = await Deliver.findById(id);
        if(!deliver) {
            return res.status(404).json({message: "Deliver not found"});
        }
        res.status(200).json(deliver);
    }catch (error) {
        res.status(500).json({message: "Error fetching deliver"});
    }
};

exports.getDeliverByEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const deliver = await Deliver.findOne({email:email, role:'deliver'});

        if(!deliver) return res.status(404).json("Deliver not found");

        res.status(200).json(deliver);
    }catch (error) {
        res.status(500).json(error);
    }
    
};

exports.addDeliver = async(req,res) => {
    try {
        const {firstName, lastName, email, password,confirmPassword,address,phone} = req.body;

        const isUserExist = await Deliver.findOne({email});

        if(isUserExist){
            return res.status(400).json({ message: "Deliver with this email already exists." });
        }

        if(password !== confirmPassword){
            return res.status(400).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(password,12);

        const deliver = new Deliver({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePic : req.file ? `/uploads/${req.file.filename}` : "",
            address,
            phone,
            role: 'deliver'
        })
        await deliver.save();

        const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "1h" });
        await emailSender.sendAccountCredentitals(firstName,lastName,email,address,phone,password);
        await emailSender.sendVerificationEmail(email,token);

        res.json({ message: "Deliver SignUp successfully", deliver });
    }catch (error) {
        res.status(500).json(error);
    }
   
}


exports.updateDeliver = async(req,res) => {
    try {
        const {firstName, lastName,email,address,phone} = req.body;
        const user_id = req.body.userId; 
        
        const existingDeliver = await Deliver.findOne({user_id});
        if (!existingDeliver) {
            return res.status(404).json({ message: "Deliver not found" });
        }

        // If a new file is uploaded, use it; otherwise, keep the existing profilePic
        const profilePic = req.file ? `/uploads/${req.file.filename}` : existingDeliver.profilePic;

        const updateData = {
            firstName,
            lastName,
            email,
            address,
            phone,
            profilePic , 
        }

        const deliver = await Deliver.findOneAndUpdate({user_id},updateData, {new:true});
        if(!deliver) return res.status(404).json("User not found");
        console.log(deliver);
        res.json({ message: "Deliver updated successfully", deliver });
    }catch (error) {
        res.status(500).json(error);
    }
}

exports.updatePassword = async (req,res) => {
    try{
        const id = req.body.userId;
        const {password, confirmPassword} = req.body;

        if(password !== confirmPassword){
            return res.status(400).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(password,12);
        const deliver = await Deliver.findOneAndUpdate({user_id: id},{password: hashedPassword},{new:true});

        res.status(200).json({message: "Password updated Successfully!"});
    }catch (error) {
        res.status(500).json(error);
    }
}

exports.deleteDeliver = async(req,res) => {
    try {
        const id = req.query.id;
        const deliver = await Deliver.findByIdAndDelete(id);
        res.json({message: "Deliver deleted successfully"});
    }catch (error) {
        res.status(500).json({message: "Error deleting deliver"});
    }
}

async function getRandomDeliver() {
  try {
    const delivers = await Deliver.find({ role: "deliver" });

    if (delivers.length === 0) {
      throw new Error("No delivers found");
    }

    for (let i = delivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [delivers[i], delivers[j]] = [delivers[j], delivers[i]];
    }

    const selectedDeliver = delivers[0];
    console.log("Selected Deliver:", selectedDeliver);

    return selectedDeliver;
  } catch (error) {
    console.error("Error selecting a deliver:", error);
    throw error;
  }
}
exports.assignDeliver = async (order_id, customer_id, address) => {
  try {
    // Get a random deliver
    const deliver = await getRandomDeliver();

    if (!deliver) {
      console.log("No available deliver");
      return null;
    }

    // Create a new delivery record
    const delivery = new Delivery({
      order_id,
      customer_id,
      deliver_id: deliver.user_id,
      address,
    });

    await delivery.save();
    console.log(`Deliver assigned to the order: ${order_id}, Deliver: ${deliver.user_id}`);
    
    // Return the delivery object instead of sending a response
    return delivery;
  } catch (error) {
    console.error("Error in assignDeliver:", error.message);
    return null;
  }
};

async function updateDeliveryCount(id){
    try{
        const deliver = await DeliverStats.findOne({deliver_id:id});
        if(!deliver){
            const deliveryStat = new DeliverStats({
                deliver_id:id,
                delivery_count: 1,
            })
            await deliveryStat.save();
        }else{
            const oldCount = deliver.delivery_count;
            const newCount = oldCount + 1;
            
            await DeliverStats.findOneAndUpdate({deliver_id:id}, {delivery_count:newCount}, {new:true});
        }
        console.log("Delivery count updated");
    }catch(error){
        console.log(error)
    }
}

exports.getDeliveries = async(req,res) => {
    try{
        const user_id = req.query.id;

        const delivery = await Delivery.find({deliver_id:user_id,status:'Not Delivered'});

        if(!delivery){
            return res.status(404).json("No delivery found");
        }

        res.status(200).json(delivery);
    }catch(error){
        return res.status(500).json(error);
    }
}

exports.getAllDeliveries = async(req,res) => {
    try{
        const user_id = req.query.id;

        const delivery = await Delivery.find({deliver_id:user_id});

        if(!delivery){
            return res.status(404).json("No delivery found");
        }

        res.status(200).json(delivery);
    }catch(error){
        return res.status(500).json( error);
    }
}


exports.updateOrderStatus = async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const order = await Order.findOne({ order_id: order_id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const delivery = await Delivery.findOne({ order_id: order_id });
        if (!delivery) {
            return res.status(404).json({ message: "Delivery not found for this order" });
        }
        await updateDeliveryCount(delivery.deliver_id);
        delivery.status = "Delivered";
        order.status = "delivered";
        await delivery.save();
        await order.save();

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};


exports.getDeliveryCount = async(req,res) => {
    try{
        const id = req.query.id;
        const count = await DeliverStats.findOne({deliver_id:id});
        if(!count){
            return res.status(404).json('No delivery yet');
        }
        res.status(200).json(count);
    }catch(error){
        res.status(500).json('Something went wrong');
    }
}


exports.getDeliveryAnalytics = async (req, res) => {
  try {
    const delivererId = req.query.id; 

    const totalDeliveries = await Delivery.countDocuments({ deliver_id: delivererId });

    const totalRevenue = await Delivery.aggregate([
      { $match: { deliver_id: delivererId, status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$order_total" } } }
    ]);

    const deliveryStatusCounts = await Delivery.aggregate([
      { $match: { deliver_id: delivererId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const delivererStats = await DeliverStats.findOne({ deliver_id: delivererId });

    const analyticsData = {
      totalDeliveries,
      totalRevenue: totalRevenue.length ? totalRevenue[0].total : 0,
      deliveryStatusCounts: deliveryStatusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      delivererStats,
    };

    res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching delivery analytics:", error);
    res.status(500).json({ message: "Error fetching delivery analytics." });
  }
};


exports.deleteStat = async(req,res) => {
    try{
        const id  = req.query.id;
        const deleteStat = await DeliverStats.findOneAndDelete({deliver_id:id});
        if(!deleteStat) return res.status(404).json('Deliver not found');

        res.status(200).json('Stat Deleted Successfully');
    }catch(error){
        res.status(500).json(error);
    }
}