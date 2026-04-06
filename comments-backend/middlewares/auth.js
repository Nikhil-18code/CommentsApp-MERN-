const jwt = require('jsonwebtoken');

const SECRET = "mysecretkey"; // move to env later

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, SECRET);

        req.user = decoded; // { id, role }

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = authMiddleware;