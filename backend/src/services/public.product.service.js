import { Product } from "../models/admin.product.js";
import { Op } from "sequelize";

// Get public products with pagination, search, and price filter
export const getPublicProductsService = async ({ 
    page = 1, 
    limit = 10, 
    search = "", 
    minPrice = null, 
    maxPrice = null, 
    sortBy = "createdAt", 
    sortOrder = "DESC" 
}) => {
    try {
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        // Search filter
        if (search) {
            whereClause[Op.or] = [
                { productName: { [Op.like]: `%${search}%` } },
                { productDescription: { [Op.like]: `%${search}%` } }
            ];
        }

        // Price range filter
        if (minPrice !== null || maxPrice !== null) {
            whereClause.productPrice = {};
            if (minPrice !== null) {
                whereClause.productPrice[Op.gte] = parseFloat(minPrice);
            }
            if (maxPrice !== null) {
                whereClause.productPrice[Op.lte] = parseFloat(maxPrice);
            }
        }

        // Validate sort options
        const validSortFields = ['createdAt', 'productPrice', 'productName'];
        const validSortOrders = ['ASC', 'DESC'];
        
        const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[finalSortBy, finalSortOrder]],
            attributes: ['id', 'productName', 'productDescription', 'productPrice', 'productStock', 'productImage', 'createdAt']
        });

        return {
            products,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };
    } catch (err) {
        console.error("Error getting public products:", err.message);
        throw err;
    }
};

// Get top products for landing page
export const getTopProductsService = async (limit = 6) => {
    try {
        const products = await Product.findAll({
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'productName', 'productDescription', 'productPrice', 'productStock', 'productImage']
        });

        return products;
    } catch (err) {
        console.error("Error getting top products:", err.message);
        throw err;
    }
};

// Get single product detail for public view
export const getPublicProductDetailService = async (productId) => {
    try {
        const product = await Product.findByPk(productId, {
            attributes: ['id', 'productName', 'productDescription', 'productPrice', 'productStock', 'productImage', 'createdAt']
        });

        if (!product) {
            throw new Error("Product not found");
        }

        return product;
    } catch (err) {
        console.error("Error getting product detail:", err.message);
        throw err;
    }
};
