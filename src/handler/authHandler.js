import { createUser, verifyEmail, verifyUser } from '../models/userModel.js';
import { passwordHash, passwordCompare } from '../utils/passwordHash.js';
import { generateToken } from '../utils/jwt.js';

async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }
        const hashedPassword = await passwordHash(password);
        const user = await createUser(
            username,
            email,
            hashedPassword
        );
        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: user
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "User email and password required"
            });
        }
        const emailExisted = await verifyEmail(email);
        if (!emailExisted) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const user = await verifyUser(email);
        const checkPassword = await passwordCompare(password, user.password_hash);
        const token = await generateToken(user);
        if (checkPassword) {
            return res.status(200).json({
                success: true,
                token: token,
                message: "User login successful"
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
    } catch (error) {
        next(error);
    }
}

export { register, login };