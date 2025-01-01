import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import redisClient from "../config/redisClient.js"
import { nanoid } from "nanoid";

const fetchLatestBlogs = async (req, res) => {
    try {
        const maxLimit = 4;
        const { page } = req.body;

        // Fetch data from the database
        const blogs = await Blog.find({ draft: false })
            .populate(
                'author',
                'personal_info.profile_img personal_info.username personal_info.fullname -_id'
            )
            .sort({ publishedAt: -1 })
            .select('blog_id title des banner activity tags publishedAt -_id')
            .skip((page - 1) * maxLimit)
            .limit(maxLimit);

        // Cache the result for subsequent requests
        await redisClient.set(req.cacheKey, JSON.stringify(blogs), {
            EX: 3600, // Cache expires in 1 hour
        });

        return res.status(200).json({ blogs });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

const fetchTrendingBlogs = async (req, res) => {
    // Query parameters to control behavior (e.g., filter out drafts)
    try {
      const blogs = await Blog.find({ draft: false })
        .populate(
          "author",
          "personal_info.profile_img personal_info.username personal_info.fullname -_id"
        )
        .sort({
          "activity.total_read": -1,     // Sort by reads first
          "activity.total_likes": -1,    // Sort by likes next
          publishedAt: -1,               // Finally, by published date
        })
        .select("blog_id title publishedAt -_id") // Only needed fields
        .limit(5); // Limit to top 5 results
  
      if (blogs.length === 0) {
        return res.status(404).json({ message: 'No blogs found' });
      }
  
      return res.status(200).json({ blogs });
    } catch (err) {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ error: 'An error occurred while fetching trending blogs' });
    }
  };

const fetchAllLatestBlogsCount = async (req, res) => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


const searchBlogs = async (req, res) => {
  const { tag, page = 1, author, query, limit, eliminate_blog } = req.body;

  let findQuery = { draft: false };
  if (tag) findQuery.tags = tag;
  if (query) findQuery.title = new RegExp(query, "i");
  if (author) findQuery.author = author;
  if (eliminate_blog) findQuery.blog_id = { $ne: eliminate_blog };

  const maxLimit = limit || 4;

  try {
      const blogs = await Blog.find(findQuery)
          .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
          .sort({ publishedAt: -1 })
          .select("blog_id title des banner activity tags publishedAt -_id")
          .skip((page - 1) * maxLimit)
          .limit(maxLimit);

      // Cache the result
      await redisClient.setEx(req.cacheKey, 3600, JSON.stringify(blogs));

      return res.status(200).json({ blogs });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
  }
};

const searchBlogsCount = async (req, res) => {
  const { tag, author, query } = req.body;

  let findQuery = { draft: false };
  if (tag) findQuery.tags = tag;
  if (query) findQuery.title = new RegExp(query, "i");
  if (author) findQuery.author = author;

  try {
      const count = await Blog.countDocuments(findQuery);

      // Cache the result
      await redisClient.setEx(req.cacheKey, 3600, JSON.stringify({ totalDocs: count }));

      return res.status(200).json({ totalDocs: count });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
  }
};


const createBlogController = async (req, res) => {
    const authorId = req.user;
    const { title, banner, content, des, draft, tags, id } = req.body;

    try {
        // Validate inputs
        if (!title.length) {
            return res.status(403).json({ error: 'You must provide a title' });
        }

        if (!draft) {
            if (!des.length || des.length > 200) {
                return res.status(403).json({
                    error: 'You must provide blog description under 200 characters',
                });
            }
            if (!banner.length) {
                return res.status(403).json({
                    error: 'You must provide blog banner to publish it',
                });
            }
            if (!content.blocks.length) {
                return res.status(403).json({
                    error: 'You must provide some blog content to publish it',
                });
            }
            if (!tags.length || tags.length > 10) {
                return res.status(403).json({
                    error: 'Provide tags in order to publish the blog, Maximum 10',
                });
            }
        }

        // Format tags and generate blog ID
        const formattedTags = tags.map((tag) => tag.toLowerCase());
        const blogId =
            id ||
            title
                .replace(/[^a-zA-Z0-9]/g, ' ')
                .replace(/\s+/g, '-')
                .trim() + nanoid();

        if (id) {
            // Update existing blog
            await Blog.findOneAndUpdate(
                { blog_id: blogId },
                { title, des, banner, content, tags: formattedTags, draft: Boolean(draft) }
            );

            return res.status(200).json({ id: blogId });
        } else {
            // Create a new blog
            const blog = new Blog({
                title,
                des,
                banner,
                content,
                tags: formattedTags,
                author: authorId,
                blog_id: blogId,
                draft: Boolean(draft),
            });

            const savedBlog = await blog.save();
            const incrementVal = draft ? 0 : 1;

            // Update user's total posts and blogs list
            await User.findOneAndUpdate(
                { _id: authorId },
                {
                    $inc: { 'account_info.total_posts': incrementVal },
                    $push: { blogs: savedBlog._id },
                },
                { new: true }
            );

            return res.status(200).json({ id: savedBlog._id });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

const getBlogController = async (req, res) => {
  const { blog_id, draft, mode } = req.body;
  const incrementVal = mode !== "edit" ? 1 : 0;

  try {
    // Find and update the blog's read count
    const blog = await Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { "activity.total_reads": incrementVal } },
      { new: true } // Return the updated blog document
    )
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname"
      )
      .select("title des banner content tags publishedAt activity blog_id draft");

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Increment author's total reads
    await User.findOneAndUpdate(
      { "personal_info.username": blog.author.personal_info.username },
      { $inc: { "account_info.total_reads": incrementVal } }
    );

    // Prevent access to draft blogs unless explicitly requested
    if (blog.draft && !draft) {
      return res.status(403).json({ error: "You cannot access draft blogs" });
    }

    return res.status(200).json({ blog });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

const likeBlogController = async (req, res) => {
  const user_id = req.user;
  const { _id, isLikedByUser } = req.body;

  const incrementVal = !isLikedByUser ? 1 : -1;

  try {
    // Update the blog's like count
    const blog = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": incrementVal } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (!isLikedByUser) {
      // Create a like notification
      const likeNotification = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      await likeNotification.save();
      return res.status(200).json({ liked_by_user: true });
    } else {
      // Remove the like notification
      await Notification.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like",
      });
      return res.status(200).json({ liked_by_user: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};



export { 
  fetchLatestBlogs,
  fetchTrendingBlogs, 
  fetchAllLatestBlogsCount,
  searchBlogs,
  searchBlogsCount,
  createBlogController,
  getBlogController,
  likeBlogController,
 };
