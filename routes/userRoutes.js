import express from "express";
import {
  deleteUser,
  getUserById,
  getUserProfile,
  getUsers,
  login,
  logout,
  register,
  refresh,
  updateUser,
  updateUserProfile,
} from "../controllers/userController.js";
import { admin } from "../middleware/authMiddleware.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// User Authentication Routes:
router.post("/login", login);
router.get("/refresh", refresh);
router.post("/register", register);
router.post("/logout", logout);

// User Profile Management:
router.get("/profile", verifyJWT, getUserProfile);
router.put("/profile", verifyJWT, updateUserProfile);

// User Management (Admin):
router.get("/", verifyJWT, admin, getUsers); // Protect middleware added
router.get("/:id", verifyJWT, admin, getUserById); // Protect middleware added
router.delete("/:id", verifyJWT, admin, deleteUser); // Protect middleware added
router.put("/:id", verifyJWT, admin, updateUser); // Protect middleware added

export default router;
