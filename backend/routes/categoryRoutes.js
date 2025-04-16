/*  
    ALL CATEGORY API ROUTES
*/
import express from "express";
import db from "../db.js";
import verifySession from "../middleware/verifySession.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Get all categories (used to filter products)
router.get("/", async (req, res) => {
    const q = "SELECT * FROM categories";
    db.query(q, (error, data) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching categories", error });
        }

        const categoryMap = {};

        data.forEach(cat => {
            categoryMap[cat.id] = { ...cat, subcategories: [] };
        });

        const nestedCategories = [];

        data.forEach(cat => {
            if (cat.parent_id) {
                if (categoryMap[cat.parent_id]) { // If category has a parent...
                    categoryMap[cat.parent_id].subcategories.push(categoryMap[cat.id]); // Add the catgory as a subcategory to their parent
                }
            } else {
                nestedCategories.push(categoryMap[cat.id]);
            }
        });
        return res.status(200).json(nestedCategories);
    });
});

router.post("/", verifySession, checkRole(['admin']), async (req, res) => {
    const { name, parent_id } = req.body;
    const user_id = req.session.userID;
    const q = "INSERT INTO categories (`name`, `user_id`, `parent_id`) VALUES (?)";
    const values = [
        name,
        user_id,
        parent_id,
    ]

    db.query(q, [values], (error, data) => {
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

// Edit category
router.put("/:id", verifySession, checkRole(['admin']), async (req, res) => {
    const category_id = req.params.id;
    const { name, parent_id } = req.body;
    const user_id = req.session.userID

    const q = "UPDATE categories SET name = ?, parent_id = ? WHERE id = ? AND user_id = ?";
    db.query(q, [name, parent_id, category_id, user_id], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: "An error occurred while editing the category",
                error: error.message
            });
        }
        if (data.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found or you do not have permission to update it",
                error: error.message
            });
        }
        return res.status(200).json({
            message: "Category successfully updated",
            data: data
        });
    });
});

// Delete category (will maybe add additional logic later to delete associated products)
router.delete("/:id", verifySession, checkRole(['admin']), async (req, res) => {
    const category_id = req.params.id;
    const user_id = req.session.userID;
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