import express from "express";
import { upload } from "../middlewares/multler.config.js";
import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController
} from "../controllers/admin.product.controller.js";

const router = express.Router();

// Create product with image upload
// POST /api/admin/products
router.post("/", upload.single("productImage"), createProductController);

// Get all products with pagination
// GET /api/admin/products?page=1&limit=10&search=keyword
router.get("/", getAllProductsController);

// Get single product
// GET /api/admin/products/:productId
router.get("/:productId", getProductByIdController);

// Update product
// PUT /api/admin/products/:productId
router.put("/:productId", upload.single("productImage"), updateProductController);

// Delete product
// DELETE /api/admin/products/:productId
router.delete("/:productId", deleteProductController);

export default router;
