import { validateToken } from "../utils/jwt.js";

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = await validateToken(token);

        if (!decoded) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        next(error);
    }
}

export default authMiddleware;