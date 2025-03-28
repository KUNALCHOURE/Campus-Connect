import { Router } from "express";
import { verifyjwt } from "../middlewares/authmiddleware.js";
import {
    createDiscussion,
    getDiscussions,
    getDiscussionById,
    updateDiscussion,
    deleteDiscussion,
    addComment,
    toggleLike,
    getLikeStatus,
    deleteComment
} from "../controllers/discussion.controllers.js";

const router = Router();

// Apply verifyjwt middleware to all routes
router.use(verifyjwt);

// Discussion routes
router.route("/")
    .post(createDiscussion)
    .get(getDiscussions);

router.route("/:discussionId")
    .get(getDiscussionById)
    .put(updateDiscussion)
    .delete(deleteDiscussion);

// Comment routes
router.route("/:discussionId/comments")
    .post(addComment);

router.route("/:discussionId/comments/:commentId")
    .delete(deleteComment);

// Like routes
router.route("/:discussionId/like")
    .post(toggleLike);

router.route("/:discussionId/like-status")
    .get(getLikeStatus);

export default router;
