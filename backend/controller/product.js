const Product = require('../model/product');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    }catch (error) {
        res.status(500).json({ error: "Error fetching products" });
    }
};


exports.getProductById = async (req, res) => {
    const pId = req.query.id;
    try {
        const product = await Product.findOne({product_id:pId});
        if(!product) return res.status(404).json({error: "Product not found"});
        res.json(product);
    }catch (error){
        res.status(500).json({ error: "Error fetching product" });
    }
};

exports.getProductByName = async (req, res) => {
    try {
        const product = await Product.findOne({product_name:req.query.name});
        if(!product) return res.status(404).json({error: "Product not found"});
        res.json(product);
    }catch (error) {
        res.status(500).json({ error: "Error fetching product" });
    }
};

exports.getProductByBrandId = async (req, res) => {
    try {
        const products = await Product.find({product_brand_id:req.query.brandId});
        if(!products) return res.status(404).json({error: "No products under this brand"});
        res.json(products);
    }catch (error) {
        res.status(500).json({ error: "Error fetching products" });
    }
};

exports.getProductId = async (req, res) => {
    const product_name = req.query.product_name;
    const brand_id = req.query.brandId;
    const category_id = req.query.catId;

    try {
        const product = await Product.findOne({
            product_name: product_name,
            product_brand_id: brand_id,
            product_category_id: category_id
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error fetching product" });
    }
};

exports.getProductByCategoryId = async (req, res) => {
    try {
        const products = await Product.find({product_category_id:req.query.pId});
        if(!products) return res.status(404).json({error: "No products under this category"});
        res.json(products);
    }catch (error) {
        res.status(500).json({ error: "Error fetching products" });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { product_name, product_description, product_status , product_price, product_brand_id,product_category_id, stock_count} = req.body;
        const product = new Product({
            product_name,
            product_description,
            product_image: req.file ? `/uploads/${req.file.filename}` : "",
            product_status,
            product_price,
            product_brand_id,
            product_category_id,
            stock_count
        });
        await product.save();
        res.json({ message: "Product added successfully", product });
    } catch (error) {
        res.status(500).json({ error: "Error adding product" });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { product_name, product_description, product_status , product_price,stock_count } = req.body;

        const product_id = req.body.product_id;

        const updateData = {
            product_name,
            product_description,
            product_status,
            product_price,
            stock_count
        };

        if (req.file) updateData.product_image = `/uploads/${req.file.filename}`;

        const product = await Product.findOneAndUpdate({product_id}, updateData, { new: true });

        if (!product) return res.status(404).json({ error: "Product not found" });

        res.json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ error: "Error updating product" });
    }
};

exports.reduceProductStock = async (req, res) => {
    try {
        const { product_id, reduceBy } = req.body;

        if (!product_id || typeof reduceBy !== 'number' || reduceBy <= 0) {
            return res.status(400).json({ error: "Product ID and a positive reduction number are required" });
        }

        // Find the product by ID
        const product = await Product.findOne({ product_id });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Calculate the new stock count
        const newStockCount = product.stock_count - reduceBy;

        if (newStockCount < 0) {
            return res.status(400).json({ error: "Insufficient stock to complete the reduction" });
        }

        // Update the stock count
        product.stock_count = newStockCount;
        await product.save();

        res.json({ message: "Stock count reduced successfully", newStockCount });
    } catch (error) {
        console.error("Error reducing stock count:", error);
        res.status(500).json({ error: "Error reducing stock count" });
    }
};


exports.deleteProduct = async(req, res) => {
    try {
        const pId = req.query.id;
        const product = await  Product.findOneAndDelete({product_id:pId});

        if(!product) return res.status(404).json({error: "Product not found"});
        res.status(200).json({ message: "Product deleted successfully" });
    }catch (error) {
        res.status(500).json({ error: "Error deleting product" });
    }
}

exports.deleteProductbyBrand = async(req, res) => {
    try {
        const brandId = req.query.id;

        if (!brandId) {
            return res.status(400).json({ error: "Brand ID is required" });
        }

        const result = await Product.deleteMany({ product_brand_id: brandId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No products found for this brand" });
        }

        res.status(200).json({ message: "Products deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting product" });
    }
};

exports.deleteProductbyCategory = async(req, res) => {
    try {
        const catId = req.query.catId;

        if (!catId) {
            return res.status(400).json({ error: "Category ID is required" });
        }

        const result = await Product.deleteMany({ product_category_id: catId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No products found for this category" });
        }

        res.status(200).json({ message: "Products deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting product" });
    }
};
