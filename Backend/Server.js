import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Correct package name
import dotenv from "dotenv";

dotenv.config(); // You must call .config() to actually load the variables

const app = express();
const PORT = process.env.PORT || 8080; // Use environment variable for port if available
app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
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