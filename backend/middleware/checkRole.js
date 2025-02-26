const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Extracted from the token
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied. You do not have permission to perform this action." });
        }
        next();
    };
};

export default checkRole;