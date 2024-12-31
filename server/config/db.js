// config/db.js
import mongoose from "mongoose";

const connectDB = () => {
  mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
  });

  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Error connecting to MongoDB:", err);
  });
};

export { connectDB };
