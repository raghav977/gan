import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { getCartItems, addToCart, removeFromCart, purchaseItems, verifyPurchaseController } from "../controllers/user.product.controller.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's cart items
router.get("/cart", getCartItems);

// Add item to cart
router.post("/cart/add/:productId", addToCart);

// Remove item from cart
router.delete("/cart/remove/:cartItemId", removeFromCart);

// Purchase items in cart
router.post("/cart/purchase", purchaseItems);

router.post("/verify-purchase", verifyPurchaseController);

export default router;