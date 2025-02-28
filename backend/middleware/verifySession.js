const verifySession = (req, res, next) => {
    if (req.session && req.session.userID) {
        next(); // Session exists and contains user ID
    } else {
        res.status(401).json({ message: "Unauthorized: Please log in" }); // No valid session
    }
};

export default verifySession;
