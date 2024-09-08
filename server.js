import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
import corsOptions from "./config/corsOptions.js";

dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());

// Increase body size limit for JSON and URL-encoded data
app.use(express.json({ limit: "20mb" })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: "20mb", extended: true })); // Adjust the limit as needed

// Handle preflight requests
app.options("*", cors(corsOptions)); // Ensure preflight requests are handled

// Routes
app.get("/", (req, res) => {
  res.send("Home");
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
//SEND ID
app.get("/api/config/paypal", (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);
// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode at http://localhost:${PORT}`
  );
});
