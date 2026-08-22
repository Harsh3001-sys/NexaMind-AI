import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Correct package name
import dotenv from "dotenv";
import mongoose from "mongoose";
import chat from "./routes/chat.js"; // Import chat routes
import authRoutes from "./routes/authRoutes.js"; // Import auth routes
import passport from "passport";
import session from "express-session";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import "./config/passport.js"; // Import passport configuration
import { connectRedis } from "./config/redis.js";

dotenv.config(); // You must call .config() to actually load the variables

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port if available

app.use(cors(
    {
    origin: "http://localhost:8080",
    credentials: true,
  }
));
app.use(express.json());
app.use(cookieParser());
app.use('/api', chat); // Use the chat routes
app.use('/auth', authRoutes); // Use the auth routes
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    }catch(err){
        console.log(err);
    }
}

app.get("/health", (req, res)=>{
  res.status(200).json({
    status: "nexamind network healthy",
    server: process.env.SERVER_NAME || "backend"
  });
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB(); // Connect to the database when the server starts
    await connectRedis(); // Connect to Redis when the server starts
})
