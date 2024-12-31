import express from 'express';  
import { signupController, signinController, googleauthController, getProfileController, searchUsersController, isLikedByUserController } from '../controllers/userController.js';
import cacheMiddleware from '../middlewares/cacheMiddleware.js';
import verifyJWT from '../middlewares/verifyJWTMiddleware.js';


const router = express.Router();

router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/google-auth", googleauthController);
router.post("/get-profile", getProfileController);
router.post(
    "/search-users",
    cacheMiddleware((req) => `searchUsers:query:${req.body.query}`),
    searchUsersController
);
router.post('/isliked-by-user', verifyJWT, isLikedByUserController);

export default router;
