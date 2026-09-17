const jwt = require('jsonwebtoken');
const emailSender = require('../utils/mailer');
const InventoryManager = require('../model/user');
const bcrypt = require('bcryptjs'); 
require("dotenv").config();


exports.getInventoryManager = async(req,res) => {
    try {
        const inventoryManagers = await InventoryManager.find({role: "inventory_manager"});
        if(!inventoryManagers) {
            return res.status(404).json({message: "No inventory Managers found"});
        }
        res.status(200).json(inventoryManagers);
    }catch (error) {
        res.status(500).json({message: "Error fetching inventoryManagers"});
    }
}

exports.getInventoryManagerById = async(req, res) => {
    try {
        const id = req.query.id;
        const inventoryManager = await InventoryManager.findById(id);
        if(!inventoryManager) {
            return res.status(404).json({message: "InventoryManager not found"});
        }
        res.status(200).json(inventoryManager);
    }catch (error) {
        res.status(500).json({message: "Error fetching inventoryManager"});
    }
};

exports.getInventoryManagerByEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const inventoryManager = await InventoryManager.findOne({email:email, role:'inventory_manager'});

        if(!inventoryManager) return res.status(404).json("InventoryManager not found");

        res.status(200).json(inventoryManager);
    }catch (error) {
        res.status(500).json(error);
    }
    
};

exports.addInventoryManager = async(req,res) => {
    try {
        const {firstName, lastName, email, password,confirmPassword,address,phone} = req.body;

        const isUserExist = await InventoryManager.findOne({email});

        if(isUserExist){
            return res.status(400).json({ message: "InventoryManager with this email already exists." });
        }

        if(password !== confirmPassword){
            return res.status(400).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(password,12);

        const inventoryManager = new InventoryManager({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePic : req.file ? `/uploads/${req.file.filename}` : "",
            address,
            phone,
            role: 'inventory_manager'
        })
        await inventoryManager.save();

        const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "1h" });
        await emailSender.sendAccountCredentitals(firstName,lastName,email,address,phone,password);
        await emailSender.sendVerificationEmail(email,token);

        res.json({ message: "InventoryManager SignUp successfully", inventoryManager });
    }catch (error) {
        res.status(500).json(error);
    }
   
}


exports.updateInventoryManager = async(req,res) => {
    try {
        const {firstName, lastName,email,address,phone} = req.body;
        const user_id = req.body.userId; 
        
        const existingInventoryManager = await InventoryManager.findOne({user_id});
        if (!existingInventoryManager) {
            return res.status(404).json({ message: "Inventory Manager not found" });
        }

        // If a new file is uploaded, use it; otherwise, keep the existing profilePic
        const profilePic = req.file ? `/uploads/${req.file.filename}` : existingInventoryManager.profilePic;

        const updateData = {
            firstName,
            lastName,
            email,
            address,
            phone,
            profilePic , 
        }

        const inventoryManager = await InventoryManager.findOneAndUpdate({user_id},updateData, {new:true});
        if(!inventoryManager) return res.status(404).json("User not found");
        console.log(inventoryManager);
        res.json({ message: "Inventory Manager updated successfully", inventoryManager });
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
        const inventoryManager = await InventoryManager.findOneAndUpdate({user_id: id},{password: hashedPassword},{new:true});

        res.status(200).json({message: "Password updated Successfully!"});
    }catch (error) {
        res.status(500).json(error);
    }
}

exports.deleteInventoryManager = async(req,res) => {
    try {
        const id = req.query.id;
        const inventoryManager = await InventoryManager.findByIdAndDelete(id);
        res.json({message: "InventoryManager deleted successfully"});
    }catch (error) {
        res.status(500).json({message: "Error deleting inventoryManager"});
    }
}
