import {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
    getOrderedProductsService
} from "../services/admin.product.service.js";

// Create a new product
export const createProductController = async (req, res) => {
    try {
        const { productName, productDescription, productPrice, productStock } = req.body;

        // Validation
        if (!productName || !productDescription || !productPrice) {
            return res.status(400).json({
                message: "Please provide productName, productDescription, and productPrice"
            });
        }

        // Get image path from multer
        const productImage = req.file ? req.file.path : null;

        if (!productImage) {
            return res.status(400).json({
                message: "Product image is required"
            });
        }

        const productData = {
            productName,
            productDescription,
            productPrice: parseFloat(productPrice),
            productStock: parseInt(productStock) || 0,
            productImage
        };

        const product = await createProductService(productData);

        return res.status(201).json({
            message: "Product created successfully",
            data: product
        });
    } catch (err) {
        console.error("Error creating product:", err.message);
        return res.status(500).json({
            message: err.message || "Failed to create product"
        });
    }
};

// Get all products for admin
export const getAllProductsController = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const result = await getAllProductsService(page, limit, search);

        return res.status(200).json({
            message: "Products fetched successfully",
            data: result.products,
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage
        });
    } catch (err) {
        console.error("Error getting products:", err.message);
        return res.status(500).json({
            message: err.message || "Failed to fetch products"
        });
    }
};

// Get single product by ID
export const getProductByIdController = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const product = await getProductByIdService(productId);

        return res.status(200).json({
            message: "Product fetched successfully",
            data: product
        });
    } catch (err) {
        console.error("Error getting product:", err.message);
        return res.status(404).json({
            message: err.message || "Product not found"
        });
    }
};

// Update product
export const updateProductController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { productName, productDescription, productPrice, productStock } = req.body;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const productData = {};
        if (productName) productData.productName = productName;
        if (productDescription) productData.productDescription = productDescription;
        if (productPrice) productData.productPrice = parseFloat(productPrice);
        if (productStock !== undefined) productData.productStock = parseInt(productStock);

        // If new image uploaded
        if (req.file) {
            productData.productImage = req.file.path;
        }

        const product = await updateProductService(productId, productData);

        return res.status(200).json({
            message: "Product updated successfully",
            data: product
        });
    } catch (err) {
        console.error("Error updating product:", err.message);
        return res.status(500).json({
            message: err.message || "Failed to update product"
        });
    }
};

// Delete product
export const deleteProductController = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        await deleteProductService(productId);

        return res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting product:", err.message);
        return res.status(500).json({
            message: err.message || "Failed to delete product"
        });
    }
};

export const getOrderedProductsController = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status = "PURCHASED" } = req.query;

        const result = await getOrderedProductsService({ page, limit, search, status });

        return res.status(200).json({
            message: "Ordered products fetched successfully",
            data: result
        });
    } catch (err) {
        console.error("Error fetching ordered products:", err.message);
        return res.status(500).json({
            message: err.message || "Failed to fetch ordered products"
        });
    }
};