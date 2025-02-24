/* Main JavaScript file */
import express from "express"
import mysql2 from "mysql2"
import dotenv from "dotenv"
import cors from "cors"
import multer from "multer"
import path from "path"
import fs from "fs"

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

// Load environment variables from .env file
dotenv.config();

// Create express connection
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use('/uploads', express.static('uploads'));

// Create MySQL connection
const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "test"
});

// Allows any json file to be sent using a client
app.use(express.json());

db.connect((error) => {
    if (error) {
        console.log("Error while attempting to connect to database: ", error);
        process.exit(1); // Exit the connection process if an error occurs
    }
    console.log(`Successfully connected to database`);
})

app.get("/", (req, res) => {
    res.status(200).json("Hello, welcome to the backend!");
})

// Get all products
app.get("/products", async (req, res) => {
    const q = "SELECT * from products"; // Select all from products table 
    db.query(q, (error, data) => { // Run the query we created (q) and return either err or data
        if (error) {
            return  res.status(500).json("An error occurred while selecting * from the database", error); // Error
        }
        return res.status(200).json(data); // Successful query operation
    });
});

// Create new product
app.post("/products", upload.single('image'), async (req, res) => {
    const { title, description, price } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;
    console.log(imagePath)

    const q = "INSERT INTO products (`title`, `description`, `price`, `image`) VALUES (?)";
    const values = [
        title, 
        description,
        price,
        imagePath,
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

// Find product by id
app.get("/products/:id", async (req, res) => {
    const product_id = req.params.id;
    const q = "SELECT * from products WHERE id = ?";

    db.query(q, [product_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while attemping to find a product",
                error: error.message
            }); // Error
        }
        return res.status(200).json({
            message: "Product found",
            data: data
        }); // Successful query operation
    });
});

// Update existing product by id
app.put("/products/:id", upload.single('image'), async (req, res) => {
    const product_id = req.params.id;
    const { title, description, price } = req.body;
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

    if (updates.length === 0) { // No updates occurred
        return res.status(400).json({
            message: "No updates were recorded"
        });
    }

    q += updates.join(", ") + " WHERE id = ?"; // Add the final piece of the query to update by id
    values.push(product_id); // Push the product_id to values to allow updating by id
    db.query(q, values, (error, data) => {
        if (error) {
            return res.status(500).json({ // Error
                message: "An error occurred when attempting to update the product",
                error: error.message
            });
        }
        if (data.affectedRows === 0) { // No product found by id
            return res.status(404).json({
                message: "Product not found"
            });
        }
        return res.status(200).json({ // Successful query operation
            message: "Product successfully updated",
            data: data
        });
    });
});

// Delete existing product by id
app.delete("/products/:id", async (req, res) => {
    const product_id = req.params.id;

    const q_fetchImage = "SELECT image FROM products WHERE id = ?";
    db.query(q_fetchImage, [product_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while attemping to locate the product",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        const imagePath = data[0].image;
        if (imagePath) {
            fs.unlink(imagePath, (error) => {
                if (error) {
                    console.error("Failed to delete product's image from database", error);
                }
            });
        }
        const q_delete = "DELETE from products WHERE id = ?";

        db.query(q_delete, [product_id], (error, data) => {
            if (error) {
                return res.status(500).json({
                    message: "An error occurred while deleting the product",
                    error: error.message
                });
            }
            if (data.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }
            return res.status(200).json({
                message: "Product successfully deleted",
                data: data
            });
        });
    });
});

app.listen(8080, () => {
    console.log("Connected to backend... listening on http://localhost:8080");
});