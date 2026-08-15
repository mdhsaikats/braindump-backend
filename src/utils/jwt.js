import jwt from "jsonwebtoken";

function generateToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
}

function validateToken(token) {
    try {
        const decoder = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        return decoder;
    } catch (error) {
        return null;
    }
}

async function getUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        const token = authHeader.split(' ')[1];
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.user_id;
        req.userId = userId;
        res.status(200).json({
            success: true,
            userId: userId
        });
    } catch {
        next(error);
        onsole.error("Token Error:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

export { validateToken, generateToken, getUser };