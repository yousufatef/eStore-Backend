import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
} from "../controllers/productController.js";
import { admin } from "../middleware/authMiddleware.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/top", getTopProducts);
router.get("/:id", getProductById);
router.post("/", verifyJWT, admin, createProduct);
router.put("/:id", verifyJWT, admin, updateProduct);
router.delete("/:id", verifyJWT, admin, deleteProduct);
router.post("/:id/reviews", verifyJWT, createProductReview);

export default router;
