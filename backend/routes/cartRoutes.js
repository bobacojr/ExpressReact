/*  
    ALL CART API ROUTES
*/
import express from "express";
import db from "../db.js";
import verifySession from "../middleware/verifySession.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Add product to shopping cart
router.post('/add', verifySession, async (req, res) => {
    const { product_id, quantity } = req.body; // Product/quantity being added to the cart
    const user_id = req.session.userID; // User id from session

    // Check if the product exists
    const product_q = "SELECT * FROM products WHERE id = ?"
    db.query(product_q, [product_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while fetching the product",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check if the product is already in the cart
        const cart_q = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
        db.query(cart_q, [user_id, product_id], (error, data) => {
            if (error) {
                return res.status(500).json({
                    message: "An error occurred while fetching your cart",
                    error: error.message
                });
            }
            if (data.length > 0) { // Product already exists in the cart, update the quantity
                const update_q = "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";
                db.query(update_q, [quantity, user_id, product_id], (error, data) => {
                    if (error) {
                        return res.status(500).json({
                            message: "An error occurred while updating your cart",
                            error: error.message
                        });
                    }
                    return res.status(200).json({
                        message: "Product quantity updated in your cart",
                        data: data
                    });
                });
            } else {

                // Add the product to the cart
                const add_q = "INSERT INTO cart (`user_id`, `product_id`, `quantity`) VALUES (?, ?, ?)";
                db.query(add_q, [user_id, product_id, quantity], (error, data) => {
                    if (error) {
                        return res.status(500).json({
                            message: "An error occurred while adding the product to your cart",
                            error: error.message
                        });
                    }
                    return res.status(200).json({
                        message: "Product successfully added to your cart",
                        data: data
                    });
                });
            }
        });
    });
});

// Get cart
router.get('/', verifySession, (req, res) => {
    const user_id = req.session.userID; // User id from session
    const q = `
        SELECT cart.*, products.title, products.price, products.image, SUM(products.price * cart.quantity) AS subtotal, SUM(cart.quantity) AS total_quantity
        FROM cart
        LEFT JOIN products ON cart.product_id = products.id
        WHERE cart.user_id = ?
        GROUP BY cart.id`;
    db.query(q, [user_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while fetching your cart"
            });
        }
        let subtotal = 0;
        let total_quantity = 0;

        for (const item of data) {
            subtotal += (item.price * item.quantity);
            total_quantity += item.quantity;
        }
        return res.status(200).json({
            message: "Cart successfully fetched",
            data: data,
            subtotal: subtotal,
            total_quantity: total_quantity
        });
    });
});

// Delete product from cart
router.delete('/remove/:product_id', verifySession, checkRole(['admin']), async (req, res) => {
    const { product_id } = req.params.id;
    const user_id = req.session.userID; // User id from session
    const q = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
    db.query(q, [user_id, product_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while deleting the product from your cart",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product not found in your cart"
            });
        }
        return res.status(200).json({
            message: "Product successfully removed from your cart",
            data: data
        });
    });
});

export default router;