/* Main JavaScript file */
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import session from "express-session";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production", // Secure cookies in production
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1200 // 24 hours
    }
}));

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);

app.get("/", (req, res) => { 
    res.status(200).json("Hello, welcome to the backend!");
})

app.listen(8080, () => {
    console.log("Connected to backend... listening on http://localhost:8080");
});