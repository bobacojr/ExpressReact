import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
    const { username, password, email, role } = req.body;

    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    const q = "INSERT INTO users (`username`, `password`, `email`, `role`) VALUES (?)";
    const values = [username, hashedPassword, email, role || "user"];

    db.query(q, [values], (error, data) => {
        if (error) {
            return res.status(500).json({ // Error
                message: "An error occurred while registering the user",
                error: error.message,
            });
        }
        return res.status(201).json({ // Successful query
            message: "User registered successfully",
            data: data
        });
    });
});

// User Login
router.post("/login", async (req, res) => {
    const { username, password, role } = req.body;

    const q = "SELECT * FROM users WHERE username = ?";
    db.query(q, [username], async (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while logging in",
                error: error.message,
            });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = data[0];
        const validPassword = await bcrypt.compare(password, user.password); // Compare passwords
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const tokenExpiration = process.env.TOKEN_EXPIRATION;
        const token = jwt.sign( // Generate a JWT token
            { id: user.id, username: user.username, role: user.role }, // Payload (data to encode)
            process.env.JWT_SECRET, // Secret key (from .env)
            { expiresIn: tokenExpiration } // Token expiration
        );

        return res.status(200).json({ // Send the token to the frontend
            message: "Login successful", 
            token
        });
    });
});

export default router;