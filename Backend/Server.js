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

dotenv.config(); // You must call .config() to actually load the variables

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port if available

app.use(cors(
    {
    origin: "http://localhost:5173",
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB(); // Connect to the database when the server starts
})



// app.post("/test", async (req, res) => {
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-goog-api-key": process.env.GEMINI_API_KEY // Note the custom header name
//     },
//     body: JSON.stringify({
//       contents: [
//         {
//           parts: [{ text: "Hello!" }]
//         }
//       ]
//     })
//   };

//   try {
//     const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent", options);
//     const data = await response.json();
//     console.log(data.candidates[0].content.parts[0].text);
    
//     // Gemini returns the text inside candidates[0].content.parts[0].text
//     res.send(data.candidates[0].content.parts[0].text);
//   } catch (err) {
//     console.log(err);
//   }
// });