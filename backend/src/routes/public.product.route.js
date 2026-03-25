import express from "express";
import {
    getPublicProductsController,
    getTopProductsController,
    getPublicProductDetailController
} from "../controllers/public.product.controller.js";

const router = express.Router();

// Get all public products with filters, search, and pagination
// GET /api/public/products/all?page=1&limit=12&search=keyword&minPrice=10&maxPrice=100&sortBy=productPrice&sortOrder=DESC
router.get("/all", getPublicProductsController);

// Get top products for landing page
// GET /api/public/products/top?limit=6
router.get("/top", getTopProductsController);

// Get single product detail
// GET /api/public/products/:productId
router.get("/:productId", getPublicProductDetailController);

export default router;
