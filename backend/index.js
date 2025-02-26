/* Main JavaScript file */
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);

app.get("/", (req, res) => {
    res.status(200).json("Hello, welcome to the backend!");
})

app.listen(8080, () => {
    console.log("Connected to backend... listening on http://localhost:8080");
});