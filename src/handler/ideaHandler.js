import { createIdea } from "../models/ideaModel";
async function createIdeaPost(req, res, next) {
  try {
    const { title, description, tags } = req.body();
    const user;
    if (!Array.isArray(tags)) {
      return res.status(400).json({
        error: "tags must be an array",
      });
      const idea = res.status(200).json({
        success: true,
        title,
        tags,
      });
    }
    const idea = await createIdea();
  } catch (error) {
    next(error);
  }
}
