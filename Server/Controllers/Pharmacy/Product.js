const PharmacyProduct = require('../../Models/PharmacyProduct');

// Create product
const createProduct = async (req, res) => {
    const { name, sku, quantity, price, description, batchNumber, expiryDate } = req.body;
    if (!name || !sku || typeof quantity !== 'number' || typeof price !== 'number') {
        return res.status(400).json({ message: 'name, sku, quantity, price are required.' });
    }
    try {
        const existing = await PharmacyProduct.findOne({ sku, hospitalId: req.user.hospitalId });
        if (existing) {
            return res.status(400).json({ message: 'Product with this SKU already exists.' });
        }
        const product = new PharmacyProduct({
            name, sku, quantity, price, description, batchNumber, expiryDate,
            hospitalId: req.user.hospitalId
        });
        await product.save();
        res.status(201).json({ message: 'Product created successfully.', product });
    } catch (err) {
        res.status(500).json({ message: 'Error creating product.', error: err.message });
    }
};

// Update product
const updateProduct = async (req, res) => {
    const { id, ...updateData } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Product id is required.' });
    }
    try {
        updateData.updatedAt = new Date();
        const product = await PharmacyProduct.findOneAndUpdate({ _id: id, hospitalId: req.user.hospitalId }, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json({ message: 'Product updated successfully.', product });
    } catch (err) {
        res.status(500).json({ message: 'Error updating product.', error: err.message });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Product id is required.' });
    }
    try {
        const product = await PharmacyProduct.findOneAndDelete({ _id: id, hospitalId: req.user.hospitalId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product.', error: err.message });
    }
};

// Get product by id
const getProduct = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Product id is required.' });
    }
    try {
        const product = await PharmacyProduct.findOne({ _id: id, hospitalId: req.user.hospitalId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product.', error: err.message });
    }
};

// Get all products for hospital
const getAllProducts = async (req, res) => {
    try {
        const products = await PharmacyProduct.find({ hospitalId: req.user.hospitalId });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products.', error: err.message });
    }
};

module.exports = { createProduct, updateProduct, deleteProduct, getProduct, getAllProducts };
