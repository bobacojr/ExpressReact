import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Get all categories (used to filter products)
router.get("/", async (req, res) => {
    const q = "SELECT * FROM categories";
    db.query(q, (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while fetching categories",
                error: error.message,
            });
        }
        return res.status(200).json(data);
    });
});

router.post("/", verifyToken, checkRole(['admin']), async (req, res) => {
    const { name } = req.body;
    const user_id = req.user.id;
    const q = "INSERT INTO categories (`name`, `user_id`) VALUES (?)";
    const values = [
        name,
        user_id,
    ]

    db.query(q, values, (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while attempting to create a new category",
                error: error.message
            });
        }
        return res.status(200).json({
            message: "Category successfully created",
            data: data
        });
    });
});

// Delete category (will maybe add additional logic later to delete associated products)
router.delete("/:id", verifyToken, checkRole(['admin']), async (req, res) => {
    const category_id = req.params.id;
    const user_id = req.user.id;
    const q_check = "SELECT * FROM categories WHERE id = ? AND user_id = ?";
    db.query(q_check, [category_id, user_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while checking the category",
                error: error.message
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }
        const q_delete = "DELETE FROM categories WHERE id = ? AND user_id = ?";
        db.query(q_delete, [category_id, user_id], (error, data) => {
            if (error) {
                return res.status(500).json({
                    message: "An error occurred while deleting the category",
                    error: error.message
                });
            }
            if (data.affectedRows === 0) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }
            return res.status(200).json({
                message: "Category successfully deleted",
                data: data
            });
        });
    });
});

export default router;