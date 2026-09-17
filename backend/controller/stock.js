const Stock = require('../model/stock');

const getStock = (req, res, next) => {
    Stock.find()
    
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

const getStockByProductId = (req, res, next) => {
    const productId = req.query.product_id;
    Stock.find({ product_id: productId })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

const getStockByName = (req, res, next) => {
    const product_name = req.query.product_name;
    Stock.find({ product_name: product_name })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

const getStockByBrand = (req, res, next) => {
    const brand_id = req.query.id;
    Stock.find({ brand_id: brand_id })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

const getStockByCategory = (req, res, next) => {
    const category_id = req.query.id;
    Stock.find({ category_id: category_id })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

const addStock = (req, res, next) => {
    console.log(req.body);
    const stock = new Stock({
        product_id: req.body.product_id,
        product_name: req.body.product_name,
        brand_id: req.body.brand_id,
        category_id: req.body.category_id,
        quantity: req.body.quantity,
        type: req.body.type || 'add',
    });
    stock.save()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

const deleteStock = (req, res, next) => {
    const id = req.body.id;
    Stock.deleteOne({ _id: id })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

exports.getStock = getStock;
exports.getStockByProductId = getStockByProductId;
exports.getStockByName = getStockByName;
exports.getStockByBrand = getStockByBrand;
exports.getStockByCategory = getStockByCategory;
exports.addStock = addStock;
exports.deleteStock = deleteStock;