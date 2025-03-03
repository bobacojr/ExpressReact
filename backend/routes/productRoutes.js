/*  
    ALL PRODUCT API ROUTES
*/
import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import verifySession from "../middleware/verifySession.js"
import verifyToken from "../middleware/verifyToken.js";
import checkRole from "../middleware/checkRole.js";

// Define router
const router = express.Router();

// Create storage used for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`Destination: ${file}`)
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        //  + Math.round(Math.random() * 1E9)
        console.log("File:", file);
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Get all products (all roles)
router.get("/", async (req, res) => {
    const { category_id } = req.query;
    //const user_id = req.user.id;
    let q = `
        SELECT products.*, categories.name AS category_name
        FROM products 
        LEFT JOIN categories ON products.category_id = categories.id`;

    if (category_id) {
        q += " WHERE products.category_id = ?";
    }

    db.query(q, [category_id], (error, data) => { // Run the query we created (q) and return either err or data
        if (error) {
            return  res.status(500).json("An error occurred while fetching products", error); // Error
        }
        return res.status(200).json(data); // Successful query operation
    });
});

// Create new product (admin only)
router.post("/", verifySession, checkRole(['admin']), upload.single('image'), async (req, res) => {
    const { title, description, price, category_id, size, color, author, brand, model, quantity} = req.body;
    const user_id = req.session.userID;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    const q = "INSERT INTO products (`title`, `description`, `price`, `image`, `category_id`, `size`, `color`, `author`, `brand`, `model`, `quantity`, `user_id`) VALUES (?)";
    const values = [
        title, 
        description,
        price,
        imagePath,
        category_id,
        size,
        color,
        author,
        brand,
        model,
        quantity,
        user_id,
    ];

    db.query(q, [values], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while attempting to create a new product",
                error: error.message
            }); // Error
        }
        return res.status(200).json({
            message: "Product created successfully",
            data: data
        }); // Successful query operation
    });
});

// Get product by id (all roles)
router.get("/:id", async (req, res) => {
    const product_id = req.params.id;
    const q = `
        SELECT products.*, categories.name AS category_name
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE products.id = ?`;

    db.query(q, [product_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while attemping to find a product",
                error: error.message
            }); // Error
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product not found or unauthorized request"
            });
        }
        return res.status(200).json({
            message: "Product found",
            data: data
        }); // Successful query operation
    });
});

// Update existing product by id (admin only)
router.put("/:id", verifySession, checkRole(['admin']), upload.single('image'), async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    const product_id = req.params.id;
    const user_id = req.session.userID;
    const { title, description, price, category_id, size, color, author, brand, model, quantity } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    let q = "UPDATE products SET ";

    const values = []; // Stores the values for each update
    const updates = []; // Stores which columns are being updated

    if (title) { // Update title
        updates.push("title = ?");
        values.push(title);
    }
    if (description) { // Update description
        updates.push("description = ?");
        values.push(description);
    }
    if (price) { // Update price
        updates.push("price = ?");
        values.push(price);
    }
    if (imagePath) { // Update imagePath/image
        updates.push("image = ?");
        values.push(imagePath);
    }
    if (category_id) { // Update category_id
        updates.push("category_id = ?");
        values.push(category_id);
    }
    if (size) { // Update size
        updates.push("size = ?");
        values.push(size);
    }
    if (color) { // Update color
        updates.push("color = ?");
        values.push(color);
    }
    if (author) { // Update author
        updates.push("author = ?");
        values.push(author);
    }
    if (brand) { // Update brand
        updates.push("brand = ?");
        values.push(brand);
    }
    if (model) { // Update model
        updates.push("model = ?");
        values.push(model);
    }
    if (quantity) { // Update quantity
        updates.push("quantity = ?");
        values.push(quantity);
    }

    if (updates.length === 0) { // No updates occurred
        return res.status(400).json({
            message: "No updates were recorded"
        });
    }

    q += updates.join(", ") + " WHERE id = ? AND user_id = ?"; // Add the final piece of the query to update by id
    values.push(product_id, user_id); // Push the product_id to values to allow updating by id
    db.query(q, values, (error, data) => {
        if (error) {
            return res.status(500).json({ // Error
                message: "An error occurred when attempting to update the product",
                error: error.message
            });
        }
        if (data.affectedRows === 0) { // No product found by id
            return res.status(404).json({
                message: "Product not found or unauthorized request"
            });
        }
        return res.status(200).json({ // Successful query operation
            message: "Product successfully updated",
            data: data
        });
    });
});

// Delete existing product by id (admin only)
router.delete("/:id", verifySession, checkRole(['admin']), async (req, res) => {
    const product_id = req.params.id;
    const user_id = req.session.userID;

    const q_fetchImage = "SELECT image FROM products WHERE id = ? AND user_id = ?";
    db.query(q_fetchImage, [product_id, user_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while attemping to locate the product",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product not found or unauthorized request"
            });
        }
        const imagePath = data[0].image;
        if (imagePath) {
            fs.unlink(imagePath, (error) => { // Deletes the products png file from the uploads folder
                if (error) {
                    console.error("Failed to delete product's image from database", error);
                }
            });
        }
        const q_delete = "DELETE FROM products WHERE id = ? AND user_id = ?";

        db.query(q_delete, [product_id, user_id], (error, data) => {
            if (error) {
                return res.status(500).json({
                    message: "An error occurred while deleting the product",
                    error: error.message
                });
            }
            if (data.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found or unauthorized request"
                });
            }
            return res.status(200).json({
                message: "Product successfully deleted",
                data: data
            });
        });
    });
});

export default router;