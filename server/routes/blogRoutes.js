import express from 'express';
import { fetchLatestBlogs, fetchTrendingBlogs, fetchAllLatestBlogsCount, searchBlogs, searchBlogsCount, createBlogController, getBlogController, likeBlogController } from '../controllers/blogController.js';
import cacheMiddleware from '../middlewares/cacheMiddleware.js';
import verifyJWT from '../middlewares/verifyJWTMiddleware.js';
import { searchBlogsCacheKeyGenerator, searchBlogsCountCacheKeyGenerator } from '../utils/cacheKeyGenerators.js';

const router = express.Router();

router.post(
    "/latest-blogs",
    cacheMiddleware((req) => `latestBlogs:page:${req.body.page}`),
    fetchLatestBlogs);

router.get(
    "/trending-blogs",
    fetchTrendingBlogs); 

router.post(
    "/all-latest-blogs-count",
    fetchAllLatestBlogsCount);    

router.post(
    "/search-blogs", 
    cacheMiddleware(searchBlogsCacheKeyGenerator), 
    searchBlogs);

router.post(
    "/search-blogs-count", 
    cacheMiddleware(searchBlogsCountCacheKeyGenerator), searchBlogsCount);

router.post(
    '/create-blog', 
    verifyJWT, 
    createBlogController);

router.post(
    "/get-blog", 
    getBlogController);    

router.post(
    "/like-blog", 
    verifyJWT, 
    likeBlogController);    

export default router;