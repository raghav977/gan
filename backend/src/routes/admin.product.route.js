import express from "express";
import { upload } from "../middlewares/multler.config.js";
import { authMiddleware, adminAuthMiddleware } from "../middlewares/auth.js";
import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController,
    getOrderedProductsController
} from "../controllers/admin.product.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminAuthMiddleware);

// Create product with image upload
// POST /api/admin/products
router.post("/", upload.single("productImage"), createProductController);

// Get all products with pagination
// GET /api/admin/products?page=1&limit=10&search=keyword
router.get("/", getAllProductsController);

// Get ordered products
router.get("/orders", getOrderedProductsController);

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
