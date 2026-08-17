import {
  addTags,
  createIdea,
  getAllIdea,
  getUserIdeas,
  deleteIdea,
  saveIdea,
  unsaveIdea,
  getUserSavedIdeas,
  toggleLike,
  getAllTagsAccordingToIdea,
} from "../models/ideaModel.js";

async function createIdeaPost(req, res, next) {
  try {
    const { title, description, tags } = req.body;
    const userId = req.user.userId;

    const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    const idea = await createIdea(userId, title, description);
    const ideaId = idea.id;

    if (tagsArray.length > 0) {
      await addTags(ideaId, userId, tagsArray);
    }

    return res.status(201).json({
      success: true,
      message: "Idea created successfully",
      idea: {
        id: ideaId,
        user_id: userId,
        title,
        description,
        tags: tagsArray,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getAllIdeas(req, res, next) {
  try {
    const userId = req.user?.userId || null;
    const searchQuery = req.query.q || req.query.search || "";
    const ideas = await getAllIdea(userId, searchQuery);

    return res.status(200).json({
      success: true,
      ideas,
    });
  } catch (error) {
    next(error);
  }
}

async function searchIdeasHandler(req, res, next) {
  try {
    const userId = req.user?.userId || null;
    const searchQuery = req.query.q || req.query.query || req.query.search || "";
    const ideas = await getAllIdea(userId, searchQuery);

    return res.status(200).json({
      success: true,
      ideas,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyIdeas(req, res, next) {
  try {
    const userId = req.user.userId;
    const ideas = await getUserIdeas(userId);

    return res.status(200).json({
      success: true,
      ideas,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteIdeaPost(req, res, next) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await deleteIdea(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Idea not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Idea deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function saveIdeaHandler(req, res, next) {
  try {
    const userId = req.user.userId;
    const { ideaId } = req.params;

    await saveIdea(userId, ideaId);

    return res.status(200).json({
      success: true,
      message: "Idea saved successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function unsaveIdeaHandler(req, res, next) {
  try {
    const userId = req.user.userId;
    const { ideaId } = req.params;

    await unsaveIdea(userId, ideaId);

    return res.status(200).json({
      success: true,
      message: "Idea unsaved successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function getSavedIdeasHandler(req, res, next) {
  try {
    const userId = req.user.userId;
    const ideas = await getUserSavedIdeas(userId);

    return res.status(200).json({
      success: true,
      ideas,
    });
  } catch (error) {
    next(error);
  }
}

async function likeIdeaHandler(req, res, next) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updated = await toggleLike(userId, id);

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export { 
  createIdeaPost, 
  getAllIdeas, 
  searchIdeasHandler,
  getMyIdeas, 
  deleteIdeaPost, 
  saveIdeaHandler, 
  unsaveIdeaHandler, 
  getSavedIdeasHandler, 
  likeIdeaHandler 
};
