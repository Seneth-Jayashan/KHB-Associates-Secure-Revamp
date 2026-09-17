const Category = require('../model/category');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    }catch (error) {
        res.status(500).json({ error: "Error fetching categories" });
    }
};


exports.getCategoryById = async (req, res) => {
    const catId = req.query.id;
    try {
        const category = await Category.findOne({category_id:catId});
        if(!category) return res.status(404).json({error: "Category not found"});
        res.json(category);
    }catch (error){
        res.status(500).json({ error: "Error fetching category" });
    }
};

exports.getCategoryByName = async (req, res) => {
    try {
        const category = await Category.findOne({category_name:req.query.name});
        if(!category) return res.status(404).json({error: "Category not found"});
        res.json(category);
    }catch (error) {
        res.status(500).json({ error: "Error fetching category" });
    }
};

exports.getCategoryByBrandId = async (req, res) => {
    try {
        const categories = await Category.find({category_brand_id:req.query.brandId});
        if(!categories) return res.status(404).json({error: "No categories under this brand"});
        res.json(categories);
    }catch (error) {
        res.status(500).json({ error: "Error fetching categories" });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { category_name, category_description, category_status , category_brand_id,category_image } = req.body;
        
        const categoryName = await Category.findOne({category_name,category_brand_id});
        
        if(categoryName){
            return res.status(400).json({error: "Category with this name and brand already exists"});
        }

        const category = new Category({
            category_name,
            category_description,
            category_image: req.file ? `/uploads/${req.file.filename}` : "",
            category_status,
            category_brand_id,
        });
        await category.save();
        res.json({ message: "Category added successfully", category });
    } catch (error) {
        res.status(500).json({ error: "Error adding category" });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const { category_id,category_name, category_description, category_status,category_brand_id} = req.body;
        
        const categoryExists = await Category.findOne({
            category_name: category_name, 
            category_id: { $ne: category_id },
            category_brand_id: category_brand_id,
        });
        
        if (categoryExists) {
            return res.status(400).json({ message: "Category name already exists for a different Category ID" });
        }
        
        const updateData = {
            category_name,
            category_description,
            category_status,
        };
        
        if (req.file) updateData.category_image = `/uploads/${req.file.filename}`;

        const category = await Category.findOneAndUpdate({ category_id}, updateData, { new: true });

        if (!category) return res.status(404).json({ error: "Category not found" });

        res.json({ message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ error: "Error updating category" });
    }
};

exports.updateCategoryProductCount = async (req,res) =>{
    try {
        const catId = req.query.id;
        const cat = await  Category.findOne({category_id:catId});

        const oldProCount = cat.product_count;
        const newProCount = oldProCount + 1;

        const updateData = {
            product_count: newProCount
        };

        const category = await Category.findOneAndUpdate({category_id:catId}, updateData, { new:true});
        res.status(200).json({message: "Product count increased successfully.",category});

    }catch (error) {
        res.status(500).json({ error: "Error updating category product count" });
    }
}

exports.deleteCategory = async(req, res) => {
    try {
        const catId = req.query.id;
        const category = await  Category.findOneAndDelete({category_id:catId});

        if(!category) return res.status(404).json({error: "Category not found"});

        res.status(200).json({ message: "Category deleted successfully" });
    }catch (error) {
        res.status(500).json({ error: "Error deleting category" });
    }
}

exports.deleteCategorybyBrand = async(req, res) => {
    try {
        const brandId = req.query.id;

        if (!brandId) {
            return res.status(400).json({ error: "Brand ID is required" });
        }

        const result = await Category.deleteMany({ category_brand_id: brandId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No categories found for this brand" });
        }

        res.status(200).json({ message: "Categories deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting category" });
    }
};
