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

// Update product quantity in cart
router.put('/update/:id', verifySession, (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body;
    const user_id = req.session.userID;

    // Check if the product exists in the cart
    const check_q = "SELECT quantity FROM cart WHERE user_id = ? AND id = ?";
    db.query(check_q, [user_id, id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred when fetching the product from your cart",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product not found in your cart"
            });
        }

        // Update the quantity
        const update_q = "UPDATE cart SET quantity = ? WHERE user_id = ? AND id = ?"
        db.query(update_q, [quantity, user_id, id], (error, data) => {
            if (error) {
                return res.status(500).json({
                    message: "An error occurred while updating the products quantity",
                    error: error.message
                });
            }
            return res.status(200).json({
                message: "Product quantity successfully updated",
                data: data
            });
        });
    });
});

// Delete/Update product item from cart
router.delete('/remove/:id', verifySession, async (req, res) => {
    const id = req.params.id;
    const quantity = req.body.quantity;
    const user_id = req.session.userID;
    console.log(`product_id: ${id}, quantity: ${quantity}, user_id: ${user_id}`)

    // Check if the product exists in the cart
    const check_q = "SELECT quantity FROM cart WHERE user_id = ? AND id = ?"
    db.query(check_q, [user_id, id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while fetching the product in your cart",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Product not found in your cart"
            });
        }

        // Delete product(s)
        const currentQuantity = data[0].quantity;
        if (quantity >= currentQuantity) {
            const delete_q = "DELETE FROM cart WHERE user_id = ? AND id = ?"
            db.query(delete_q, [user_id, id], (error, data) => {
                if (error) {
                    return res.status(500).json({
                        message: "An error occurred while removing the products from your cart",
                        error: error.message
                    });
                }
                return res.status(200).json({
                    message: "Selected product(s) have been removed from your cart",
                    data: data
                });
            });
        } else { // Update quantity
            const update_q = "UPDATE cart SET quantity = quantity - ? WHERE user_id = ? AND id = ?";
            db.query(update_q, [quantity, user_id, id], (error, data) => {
                if (error) {
                    return res.status(500).json({
                        message: "An error occurred while updating the product quantity",
                        error: error.message
                    });
                }
                return res.status(200).json({
                    message: "Product quantity successfully updated",
                    data: data
                });
            });
        }
    });
});

export default router;