//import redisClient from '../config/redisClient.js';

// const cacheMiddleware = (cacheKeyGenerator) => async (req, res, next) => {
//     try {
//         // Generate the cache key using a function or a static key
//         const cacheKey = cacheKeyGenerator(req);

//         // Check if data exists in Redis cache
//         const cachedData = await redisClient.get(cacheKey);
//         if (cachedData) {
//             console.log('Cache hit');
//             return res.status(200).json(JSON.parse(cachedData));
//         }

//         console.log('Cache miss');
//         // Attach the cache key to the request for later use in the controller
//         req.cacheKey = cacheKey;

//         next(); // Proceed to the controller
//     } catch (err) {
//         console.error('Redis Middleware Error:', err);
//         next(); // Proceed without cache if an error occurs
//     }
// };

// export default cacheMiddleware;
