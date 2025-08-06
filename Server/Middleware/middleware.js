const jwt = require("jsonwebtoken");

require("dotenv").config();

const createToken = (user) => {
    // Flat payload for consistency
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
};



const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid!");
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("You are not authenticated!");
    }
};

const verifyTokenAndRole = (allowedRoles) => {
    return (req, res, next) => {
        verifyToken(req, res, () => {
                        // The decoded payload is req.user, and the actual user data is nested within req.user.user
            const role = req.user?.role || req.user?.user?.role;
            if (role && allowedRoles.includes(role)) {
                next();
            } else {
                res.status(403).json("You are not authorized to perform this action!");
            }
        });
    };
};

const isSuperadmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Superadmin role required.' });
    }
};

module.exports = {createToken , verifyToken, verifyTokenAndRole, isSuperadmin};
