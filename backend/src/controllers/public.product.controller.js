import {
    getPublicProductsService,
    getTopProductsService,
    getPublicProductDetailService
} from "../services/public.product.service.js";

// Get public products with filters and pagination
export const getPublicProductsController = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = "",
            minPrice = null,
            maxPrice = null,
            sortBy = "createdAt",
            sortOrder = "DESC"
        } = req.query;

        const result = await getPublicProductsService({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            sortBy,
            sortOrder
        });

        return res.status(200).json({
            message: "Products fetched successfully",
            data: result.products,
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage
        });
    } catch (err) {
        console.error("Error getting public products:", err.message);
        return res.status(500).json({
            message: err.message || "Failed to fetch products"
        });
    }
};

// Get top products for landing page
export const getTopProductsController = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;

        const products = await getTopProductsService(limit);

        return res.status(200).json({
            message: "Top products fetched successfully",
            data: products
        });
    } catch (err) {
        console.error("Error getting top products:", err.message);
        return res.status(500).json({
            message: err.message || "Failed to fetch top products"
        });
    }
};

// Get single product detail
export const getPublicProductDetailController = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const product = await getPublicProductDetailService(productId);

        return res.status(200).json({
            message: "Product fetched successfully",
            data: product
        });
    } catch (err) {
        console.error("Error getting product detail:", err.message);
        return res.status(404).json({
            message: err.message || "Product not found"
        });
    }
};
