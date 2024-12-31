// Generate cache key dynamically for searchBlogs
const searchBlogsCacheKeyGenerator = (req) => {
    const { tag, page, author, query, limit, eliminate_blog } = req.body;
    return `searchBlogs:tag:${tag || "none"}:author:${author || "none"}:query:${query || "none"}:page:${page || 1}:limit:${limit || 4}:eliminateBlog:${eliminate_blog || "none"}`;
};

// Generate cache key dynamically for searchBlogsCount
const searchBlogsCountCacheKeyGenerator = (req) => {
    const { tag, author, query } = req.body;
    return `searchBlogsCount:tag:${tag || "none"}:author:${author || "none"}:query:${query || "none"}`;
};

export { searchBlogsCacheKeyGenerator, searchBlogsCountCacheKeyGenerator };