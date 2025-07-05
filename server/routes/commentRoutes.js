import express from "express";
import { addCommentController, getBlogCommentsController, getRepliesController, deleteCommentController } from "../controllers/commentController.js";
import verifyJWT from "../middlewares/verifyJWTMiddleware.js";
//import cacheMiddleware from "../middlewares/cacheMiddleware.js";

const router = express.Router();

router.post("/add-comment", verifyJWT, addCommentController);

router.post(
    "/get-blog-comments",
    //cacheMiddleware((req) => `getBlogComments:blogId:${req.body.blog_id}:skip:${req.body.skip}`),
    getBlogCommentsController
);

router.post(
    "/get-replies",
    //cacheMiddleware((req) => `getReplies:commentId:${req.body._id}:skip:${req.body.skip}`),
    getRepliesController
);

router.post("/delete-comment", verifyJWT, deleteCommentController);

export default router;
