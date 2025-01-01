import express from "express";
import "dotenv/config";
import cors from "cors";
import admin from "firebase-admin";
import userRouter from "./routes/userRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import redisClient from "./config/redisClient.js";
import { connectDB } from "./config/db.js";

const server = express();
let PORT = 3000;

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_PRIVATE_KEY)
  ),
});


server.use(express.json());
server.use(
  cors({
    origin: "*",
    // origin: [
    //   "https://blogging-web-app-frontend.vercel.app",
    //   "http://localhost:3000",
    // ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Connect to MongoDB
connectDB();

server.use("/api/user", userRouter);
server.use("/api/blog", blogRouter);
server.use("/api/comment", commentRouter);

// Start the server
server.listen(PORT, async () => {
  console.log(`Server is running on port : ${PORT}`);

  try {
      // Ensure Redis client is ready
      await redisClient.ping();
      console.log('Redis is ready');
  } catch (err) {
      console.error('Redis connection failed:', err.message);
  }
});
