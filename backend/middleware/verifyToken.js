import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer <token>
    if (!token) {
        return res.status(401).json({ 
            message: "Access denied. No token provided." 
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to the request
        next();
    } catch (error) {
        return res.status(400).json({ 
            message: "Invalid or expired token." 
        });
    }
};

export default verifyToken;