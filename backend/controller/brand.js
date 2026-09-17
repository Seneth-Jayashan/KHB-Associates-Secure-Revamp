const Brand = require("../model/brand");

exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: "Error fetching brands" });
    }
};

exports.getBrandById = async (req, res) => {
    try {
        const brand_id = req.query.id;
        const brand = await Brand.findOne({brand_id});
        if (!brand) return res.status(404).json({ error: "Brand not found" });
        res.json(brand);
    } catch (error) {
        res.status(500).json({ error: "Error fetching brand" });
    }
};

exports.addBrand = async (req, res) => {
    try {
            
    // Validate that file exists
    if (!req.file) {
      return res.status(400).json({ message: 'Brand image is required' });
    }
        const { brand_name, brand_description, brand_status } = req.body;

        const brandName = await Brand.findOne({brand_name});
        if(brandName){
            return res.status(400).json({message:"Brand name already exist"});
        }
        const brand = new Brand({
            brand_name,
            brand_description,
            brand_image: req.file ? `/uploads/${req.file.filename}` : "",
            brand_status,
        });
        await brand.save();
        res.json({ message: "Brand added successfully", brand });
    } catch (error) {
        res.status(500).json({ error: "Error adding brand" });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { brand_id,brand_name, brand_description, brand_status } = req.body;

        const brandExists = await Brand.findOne({
            brand_name: brand_name, 
            brand_id: { $ne: brand_id }
        });
        
        if (brandExists) {
            return res.status(400).json({ message: "Brand name already exists for a different brand ID" });
        }

        const updateData = {
            brand_name,
            brand_description,
            brand_status,
        };
        if (req.file) updateData.brand_image = `/uploads/${req.file.filename}`;
        const brand = await Brand.findOneAndUpdate({brand_id}, updateData, { new: true });
        if (!brand) return res.status(404).json({ error: "Brand not found" });
        res.json({ message: "Brand updated successfully", brand });
    } catch (error) {
        res.status(500).json({ error: "Error updating brand" });
    }
};

exports.updateCategoryCount = async (req,res) => {
    try {
        const brand_id = req.body.brand_id;
        const result = await Brand.findOne({brand_id});
        const catCount = result.category_count;
        const updateData = {
            category_count: catCount + 1
        };
        const brand = await Brand.findOneAndUpdate({brand_id}, updateData, { new: true });
        res.json({ message: "Category count updated successfully", brand });
    }catch (error) {
        res.status(500).json({ error: "Error updating category count" });
    }
}

exports.deleteBrand = async (req, res) => {
    const id = req.query.id;
    try {
        const brand = await Brand.findOneAndDelete({brand_id:id});
        if (!brand) return res.status(404).json({ error: "Brand not found" });
        res.json({ message: "Brand deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting brand" });
    }
};
