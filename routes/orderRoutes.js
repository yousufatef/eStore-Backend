import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
} from "../controllers/orderController.js";
import { admin } from "../middleware/authMiddleware.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
const router = express.Router();

//user
router.post("/", verifyJWT, addOrderItems);
router.get("/mine", verifyJWT, getMyOrders);
router.get("/:id", verifyJWT, getOrderById);
router.put("/:id/pay", verifyJWT, updateOrderToPaid);

//Admin routes
router.put("/:id/deliver", verifyJWT, admin, updateOrderToDelivered);
router.get("/", verifyJWT, admin, getOrders);

export default router;
