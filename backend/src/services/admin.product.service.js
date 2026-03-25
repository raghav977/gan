import { Product } from "../models/admin.product.js";
import { Op } from "sequelize";

// Create a new product
export const createProductService = async (productData) => {
    try {
        const product = await Product.create(productData);
        return product;
    } catch (err) {
        console.error("Error creating product:", err.message);
        throw err;
    }
};

// Get all products for admin with pagination
export const getAllProductsService = async (page = 1, limit = 10, search = "") => {
    try {
        const offset = (page - 1) * limit;
        
        const whereClause = search
            ? {
                [Op.or]: [
                    { productName: { [Op.like]: `%${search}%` } },
                    { productDescription: { [Op.like]: `%${search}%` } }
                ]
            }
            : {};

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return {
            products,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };
    } catch (err) {
        console.error("Error getting products:", err.message);
        throw err;
    }
};

// Get single product by ID
export const getProductByIdService = async (productId) => {
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    } catch (err) {
        console.error("Error getting product:", err.message);
        throw err;
    }
};

// Update product
export const updateProductService = async (productId, productData) => {
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        await product.update(productData);
        return product;
    } catch (err) {
        console.error("Error updating product:", err.message);
        throw err;
    }
};

// Delete product
export const deleteProductService = async (productId) => {
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        await product.destroy();
        return { message: "Product deleted successfully" };
    } catch (err) {
        console.error("Error deleting product:", err.message);
        throw err;
    }
};
