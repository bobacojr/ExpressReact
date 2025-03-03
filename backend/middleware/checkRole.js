const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = String(req.session.role);
        console.log("Session:", req.session); // Log the session
        console.log("User Role:", req.session.role); // Log the user role
        if (req.session && roles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: "Access denied: Insufficient privileges" });
        }
    };
};

export default checkRole;
