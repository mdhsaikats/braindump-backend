import express from "express";
const router = express.Router();

import { userName, updateUserProfiel } from "../handler/userHandler.js";
router.get("/profile", userName);
router.patch("/update", updateUserProfiel);
export default router;
