import express from "express";
const router = express.Router();
import { createIdeaPost } from "../handler/ideaHandler.js";

router.post("/idea", createIdeaPost);

export default router;
