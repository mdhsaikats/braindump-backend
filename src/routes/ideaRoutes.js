import express from "express";
const router = express.Router();
import {
  createIdeaPost,
  getAllIdeas,
  searchIdeasHandler,
  getMyIdeas,
  deleteIdeaPost,
  saveIdeaHandler,
  unsaveIdeaHandler,
  getSavedIdeasHandler,
  likeIdeaHandler,
  updateUserIdeas,
} from "../handler/ideaHandler.js";

router.get("/idea", getAllIdeas);
router.get("/ideas/search", searchIdeasHandler);
router.get("/idea/search", searchIdeasHandler);
router.post("/idea", createIdeaPost);
router.get("/my-ideas", getMyIdeas);
router.delete("/idea/:id", deleteIdeaPost);
router.get("/saves", getSavedIdeasHandler);
router.post("/saves/:ideaId", saveIdeaHandler);
router.delete("/saves/:ideaId", unsaveIdeaHandler);
router.post("/idea/:id/like", likeIdeaHandler);
router.patch("/idea/update", updateUserIdeas);

export default router;
