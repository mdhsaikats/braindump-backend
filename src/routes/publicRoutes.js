import express from "express";
const router = express.Router();
import { getAllIdeas } from "../handler/ideaHandler.js";

router.get("/idea", getAllIdeas);

export default router;
