const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./router");
const path = require("path");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Load API routes
app.use("/api", router);

// Order Checking
require('./utils/orderAssign');

// Stock Monitor
require('./utils/lowStockMonitor');

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
    }
};

connectDB();

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});