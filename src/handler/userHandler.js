import { getUserProfile, updateUserProfile } from "../models/userModel.js";

async function userName(req, res, next) {
  try {
    const userId = req.user.userId;

    const user = await getUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserProfiel(req, res, next) {
  try {
    const { username, email, bio } = req.body;
    const userId = req.user.userId;
    const user = await updateUserProfile(userId, username, email, bio);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "failed to update the user data",
      });
    }
    res.status(200).json({
      success: true,
      message: "User data updated sucessfuly",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export { userName, updateUserProfiel };
