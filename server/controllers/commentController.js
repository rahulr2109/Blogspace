import Blog from "../Schema/Blog.js";
import Comment from "../Schema/Comment.js";
import Notification from "../Schema/Notification.js";
//import redisClient from "../config/redisClient.js";

const addCommentController = async (req, res) => {
  const user_id = req.user;
  const { _id, comment, blog_author, replying_to } = req.body;

  if (!comment || !comment.trim().length) {
    return res.status(403).json({ error: "Comment can't be empty" });
  }

  try {
    // Create a comment object
    const commentObj = {
      blog_id: _id,
      blog_author,
      comment,
      commented_by: user_id,
    };

    if (replying_to) {
      commentObj.parent = replying_to;
      commentObj.isReply = true;
    }

    const commentFile = await new Comment(commentObj).save();
    const { comment: savedComment, commentedAt, children } = commentFile;

    // Update the Blog's comment activity
    await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    );

    const notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;

      const replyingToCommentDoc = await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      );

      notificationObj.notification_for = replyingToCommentDoc.commented_by;
    }

    // Create notification
    await new Notification(notificationObj).save();

    return res.status(200).json({
      comment: savedComment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

const getBlogCommentsController = async (req, res) => {
  const { blog_id, skip } = req.body;
  const maxLimit = 5;

  try {
    const comments = await Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({ commentedAt: -1 });

    // Cache the fetched data in Redis
    // await redisClient.set(req.cacheKey, JSON.stringify(comments), {
    //   EX: 3600, // Set an expiry of 1 hour
    // });

    return res.status(200).json(comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

const getRepliesController = async (req, res) => {
  const { _id, skip } = req.body;
  const maxLimit = 5;

  try {
    const doc = await Comment.find({ _id })
      .populate({
        path: "children",
        options: {
          limit: maxLimit,
          skip: skip,
          sort: { commentedAt: -1 },
        },
        populate: {
          path: "commented_by",
          select:
            "personal_info.username personal_info.fullname personal_info.profile_img",
        },
        select: "-blog_id -updatedAt",
      })
      .select("children");

    // Cache the fetched data in Redis
    // await redisClient.set(req.cacheKey, JSON.stringify(doc[0].children), {
    //   EX: 3600, // Set expiry time to 1 hour
    // });

    return res.status(200).json({ replies: doc[0].children });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};


const deleteComments = async (_id, skip = 0) => {
  try {
    const queue = [_id];
    while (queue.length) {
      const currentId = queue.pop();
      const comment = await Comment.findOneAndDelete({ _id: currentId });

      if (comment) {
        // Handle parent-child relationships and notifications
        if (comment.parent) {
          await Comment.findOneAndUpdate(
            { _id: comment.parent },
            { $pull: { children: currentId } }
          );
        }
        await Notification.deleteMany({ $or: [{ comment: currentId }, { reply: currentId }] });
        await Blog.findOneAndUpdate(
          { _id: comment.blog_id },
          {
            $pull: { comments: currentId },
            $inc: { "activity.total_comments": -1 },
            "activity.total_parent_comments": comment.parent ? 0 : -1,
          }
        );
        // Add children to the queue for deletion
        queue.push(...comment.children);
      }

      // Invalidate cache
      //await redisClient.del(`getBlogComments:blogId:${comment.blog_id}:skip:${skip}`);
    }
  } catch (err) {
    console.error(err.message);
  }
};


// Controller for deleting a comment
const deleteCommentController = async (req, res) => {
    const user_id = req.user;
    const { _id } = req.body;

    console.log("comment_id from server: ", _id)
    console.log("user_id from server: ",  user_id)
    
    try {
    const comment = await Comment.findOne({ _id });

    if (comment) {
      // Check if the user is authorized to delete the comment
      console.log("comment.commented_by: "+comment.commented_by)
      console.log("comment.blog_author: "+comment.blog_author)
      if (user_id === comment.commented_by || user_id === comment.blog_author) {
        await deleteComments(_id);
        return res.status(200).json({ status: "Comment deleted" });
      } else {
        return res.status(403).json({ error: "You are not authorized to delete this comment" });
      }
    } else {
      return res.status(404).json({ error: "Comment not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


export { 
    addCommentController,
    getBlogCommentsController,
    getRepliesController,
    deleteCommentController,
};
