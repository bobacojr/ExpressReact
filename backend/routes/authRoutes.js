import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 5 attempts
    message: "Too many requests, please try again later"
});

// User Registration
router.post("/register", 
    [
        body("username").notEmpty().trim().escape(),
        body("password").trim().escape(),
        body("email").isEmail().normalizeEmail(),
        body("role").optional().trim().escape(),
    ],
    authLimiter, // Apply rate limiting
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // Check for validation errors
            return res.status(400).json({ 
                errors: errors.array() 
            });
        }

        const { username, password, email, role } = req.body;
        try {
            const salt = await bcrypt.genSalt(10); // Generate a salt
            const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

            const q = "INSERT INTO users (`username`, `password`, `email`, `role`) VALUES (?)";
            const values = [username, hashedPassword, email, role || "user"]; // Default role is user

            db.query(q, [values], (error, data) => {
                if (error) {
                    return res.status(500).json({
                        message: "An error occurred while registering the user",
                        error: error.message,
                    });
                }
                return res.status(201).json({
                    message: "Registration successful",
                    data: data,
                });
            });
        } catch (error) {
            return res.status(500).json({
                message: "An error occurred while registering the user",
                error: error.message,
            });
        }
    }
);

// User Login
router.post(
    "/login",
    [
        body("username").notEmpty().trim().escape(),
        body("password").isLength({ min: 8 }).trim().escape(),
    ],
    authLimiter, // Apply rate limiting
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // Check for validation errors
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
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

                req.session.userID = user.id;
                req.session.username = user.username;
                req.session.role = user.role;

                return res.status(200).json({
                    message: "Login successful",
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                    },
                });
            });
        } catch (error) {
            return res.status(500).json({
                message: "An error occurred while logging in",
                error: error.message,
            });
        }
    }
);

// User logout
router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Failed to logout"
            });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        return res.status(200).json({
            message: "Logged out successfully"
        });
    });
});

// Get the current user
router.get('/me', (req, res) => {
    if (req.session.userID) {
        return res.status(200).json({
            user: {
                id: req.session.userID,
                username: req.session.username,
                role: req.session.role
            }
        });
    } else {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }
});

export default router;

/*
JWT-BASED LOGIN/REGISTRATION
----------------------------

// User Registration
router.post("/register", async (req, res) => {
    const { username, password, email, role } = req.body;

    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    const q = "INSERT INTO users (`username`, `password`, `email`, `role`) VALUES (?)";
    const values = [username, hashedPassword, email, role || "user"]; // Default role is user

    db.query(q, [values], (error, data) => {
        if (error) {
            return res.status(500).json({ // Error
                message: "An error occurred while registering the user",
                error: error.message,
            });
        }
        return res.status(201).json({ // Successful query
            message: "Registration successfully",
            data: data
        });
    });
});

// User Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

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

*/