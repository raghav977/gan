import { Product } from "../models/admin.product.js";
import { UserProduct } from "../models/user.product.js";
import user from "../models/usersModels.js";
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

export const getOrderedProductsService = async ({
    status = 'PURCHASED',
    page = 1,
    limit = 10,
    search = ''
} = {}) => {
    try {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const parsedPage = Math.max(parseInt(page) || 1, 1);
        const offset = (parsedPage - 1) * parsedLimit;
        const normalizedStatus = status ? String(status).toUpperCase() : null;
        const normalizedSearch = search?.trim();

        const whereClause = {};
        if (normalizedStatus) {
            whereClause.status = normalizedStatus;
        }

        if (normalizedSearch) {
            whereClause[Op.or] = [
                { '$product.productName$': { [Op.like]: `%${normalizedSearch}%` } },
                { '$buyer.username$': { [Op.like]: `%${normalizedSearch}%` } },
                { '$buyer.email$': { [Op.like]: `%${normalizedSearch}%` } }
            ];
        }

        const { count, rows } = await UserProduct.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'productName', 'productPrice', 'productImage']
                },
                {
                    model: user,
                    as: 'buyer',
                    attributes: ['id', 'username', 'email', 'contact', 'role']
                }
            ],
            order: [['updatedAt', 'DESC']],
            limit: parsedLimit,
            offset,
            distinct: true,
            subQuery: false
        });

        return {
            orders: rows,
            total: count,
            totalPages: Math.max(Math.ceil(count / parsedLimit), 1),
            currentPage: parsedPage,
            perPage: parsedLimit
        };
    } catch (err) {
        console.error("Error getting ordered products:", err.message);
        throw err;
    }
};
