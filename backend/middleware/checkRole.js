const checkRole = (roles) => {
    return (req, res, next) => {
        if (req.session && roles.includes(req.session.userRole)) {
            next();
        } else {
            res.status(403).json({ message: "Access denied: Insufficient privileges" });
        }
    };
};

export default checkRole;
