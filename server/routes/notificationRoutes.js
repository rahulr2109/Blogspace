import express from 'express';
import verifyJWT from "../middlewares/verifyJWTMiddleware.js";
import { newNotificationController, notificationController, allNotificationCountController } from '../controllers/notificationController.js';

const router = express.Router();

router.get("/new-notification",verifyJWT, newNotificationController);

router.post("/notifications",verifyJWT, notificationController);

router.post("/all-notifications-count",verifyJWT, allNotificationCountController);

export default router;