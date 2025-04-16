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
        SELECT products.*, 
            categories.name AS category_name,
            variants.variant_id,
            variants.variant_size,
            variants.variant_color,
            variants.variant_quantity,
            variants.variant_price,
            variants.variant_image
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        LEFT JOIN product_variants AS variants ON products.id = variants.product_id`;

    const values = [];
    if (category_id) {
        q += " WHERE products.category_id = ?";
        values.push(category_id);
    }

    db.query(q, values, (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while fetching all products",
                error: error.message
            });
        }
        const productsMap = [];
        data.forEach(row => { // Add each product to the map
            if (!productsMap[row.id]) {
                productsMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    image: row.image,
                    price: row.price,
                    author: row.author,
                    brand: row.brand,
                    model: row.model,
                    quantity: row.quantity,
                    category_id: row.category_id,
                    category_name: row.category_name,
                    variants: []
                };
            }
            if (row.variant_id) { // If variants are found add those to the product's variants array
                productsMap[row.id].variants.push({
                    variant_id: row.variant_id,
                    variant_size: row.variant_size,
                    variant_color: row.variant_color,
                    variant_quantity: row.variant_quantity,
                    variant_price: row.variant_price,
                    variant_image: row.variant_image
                });
            }
        });
        return res.status(200).json(Object.values(productsMap)); // Return the products map
    });
});

router.get("/:id", async (req, res) => {
    const product_id = req.params.id;
    let q = `
        SELECT
            products.id,
            products.title,
            products.description,
            products.image,
            products.price,
            products.author,
            products.brand,
            products.model,
            products.quantity AS product_quantity,
            categories.name AS category_name,
            variants.variant_id,
            variants.variant_size,
            variants.variant_color,
            variants.variant_type,
            variants.variant_quantity,
            variants.variant_price,
            variants.variant_image
        FROM products 
        LEFT JOIN categories ON products.category_id = categories.id
        LEFT JOIN product_variants AS variants ON products.id = variants.product_id
        WHERE products.id = ?`;

    db.query(q, [product_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurrred while finding a product:",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        const product = {
            id: data[0].id,
            title: data[0].title,
            description: data[0].description,
            image: data[0].image,
            price: data[0].price,
            author: data[0].author,
            brand: data[0].brand,
            category_id: data[0].category_id,
            category_name: data[0].category_name,
            quantity: data[0].product_quantity,
            variants: []
        };
        data.forEach(row => {
            if (row.variant_id) {
                product.variants.push({
                    variant_id: row.variant_id,
                    variant_size: row.variant_size,
                    variant_color: row.variant_color,
                    variant_type: row.product_type,
                    variant_quantity: row.variant_quantity,
                    variant_price: row.variant_price,
                    variant_image: row.variant_image,
                });
            }
        });
        return res.status(200).json({
            message: "Product found",
            data: product
        });
    });
});

router.get("/:id/quantity_check", async (req, res) => {
    console.log("✔️ quantity_check route hit", req.params.id, req.query.variant_id);
    const product_id = req.params.id;
    const variant_id = req.query.variant_id;

    const q = variant_id 
        ? `
        SELECT
            v.variant_quantity,
            IFNULL(SUM(c.quantity), 0) AS quantity_in_cart,
            (v.variant_quantity - IFNULL(SUM(c.quantity), 0)) AS available_quantity
        FROM product_variants v
        LEFT JOIN cart c ON v.variant_id = c.variant_id
        WHERE v.variant_id = ?
        GROUP BY v.variant_id;
        `
        : 
        `SELECT
            p.quantity,
            IFNULL(SUM(c.quantity), 0) AS quantity_in_cart,
            (p.quantity - IFNULL(SUM(c.quantity), 0)) as available_quantity
        FROM products p
        LEFT JOIN cart c ON p.id = c.product_id AND c.variant_id IS NULL
        WHERE p.id = ?
        GROUP BY p.id;
        `;
    db.query(q, [variant_id || product_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while attempting to check a products quantity",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product or variant not found"
            });
        }
        return res.status(200).json({
            message: "Quantity check successful",
            available_quantity: data[0].available_quantity
        });
    });
});

// Create new product (admin only)
router.post("/", verifySession, checkRole(['admin']), upload.single('image'), async (req, res) => {
    const { title, description, price, category_id, author, brand, model, quantity} = req.body;
    const user_id = req.session.userID;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    const q = "INSERT INTO products (`title`, `description`, `price`, `image`, `category_id`, `author`, `brand`, `model`, `quantity`, `user_id`) VALUES (?)";
    const values = [
        title, 
        description,
        price,
        imagePath,
        category_id,
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


// Update existing product by id (admin only)
router.put("/:id", verifySession, checkRole(['admin']), upload.single('image'), async (req, res) => {
    const product_id = req.params.id;
    const user_id = req.session.userID;
    const { title, description, price, category_id, author, brand, model, quantity } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

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