import {
  addTags,
  createIdea,
  getAllIdea,
  getAllTagsAccordingToIdea,
} from "../models/ideaModel.js";

async function createIdeaPost(req, res, next) {
  try {
    const { title, description, tags } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: "tags must be an array",
      });
    }

    const idea = await createIdea(userId, title, description);

    const ideaId = idea.id;

    await addTags(ideaId, userId, tags);

    return res.status(201).json({
      success: true,
      idea: {
        id: ideaId,
        title,
        description,
        tags,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getAllIdeas(req, res, next) {
  try {
    const ideas = await getAllIdea();

    return res.status(200).json({
      success: true,
      ideas,
    });
  } catch (error) {
    next(error);
  }
}

export { createIdeaPost, getAllIdeas };
