// import express from "express";
// import cors from "cors";
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Correct package name
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import chat from "./routes/chat.js"; // Import chat routes
// import authRoutes from "./routes/authRoutes.js"; // Import auth routes
// import passport from "passport";
// import session from "express-session";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";
// import "./config/passport.js"; // Import passport configuration
// import { connectRedis } from "./config/redis.js";

// dotenv.config(); // You must call .config() to actually load the variables

// const app = express();
// const PORT = process.env.PORT || 5000; // Use environment variable for port if available
// const FRONTEND_URL = process.env.FRONTEND_URL; // Use environment variable for frontend URL if available
// app.use(cors(
//     {
//     origin: FRONTEND_URL || "http://localhost:8080",
//     credentials: true,
//   }
// ));
// app.use(express.json());
// app.use(cookieParser());
// app.use('/api', chat); // Use the chat routes
// app.use('/auth', authRoutes); // Use the auth routes
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// const connectDB = async ()=>{
//     try{
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("MongoDB connected successfully");
//     }catch(err){
//         console.log(err);
//     }
// }

// app.get("/health", (req, res)=>{
//   res.status(200).json({
//     status: "nexamind network healthy",
//     server: process.env.SERVER_NAME || "backend"
//   });
// });

// app.listen(PORT, async () => {
//     console.log(`Server is running on port ${PORT}`);
//     await connectDB(); // Connect to the database when the server starts
//     await connectRedis(); // Connect to Redis when the server starts
// })


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import chat from "./routes/chat.js";
import authRoutes from "./routes/authRoutes.js";
import "./config/passport.js";

import { connectRedis } from "./config/redis.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  console.error("❌ FRONTEND_URL is not configured");
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error("❌ SESSION_SECRET is not configured");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not configured");
  process.exit(1);
}

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));

// --------------------------------------------------
// Session
// --------------------------------------------------

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use("/api", chat);
app.use("/auth", authRoutes);

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    server: process.env.SERVER_NAME || "backend",
  });
});

// --------------------------------------------------
// Database
// --------------------------------------------------

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 MongoDB connected successfully");
  } catch (err) {
    console.error("🔴 MongoDB connection failed:", err);
    throw err;
  }
};

// --------------------------------------------------
// Start Server
// --------------------------------------------------

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🟢 Server running on port ${PORT}`);
      console.log(`🟢 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("🔴 Server startup failed:", error);
    process.exit(1);
  }
};

startServer();