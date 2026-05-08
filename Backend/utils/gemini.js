import "dotenv/config";

const getResponse = async (userMessage, history = []) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [
        ...history, // Spread previous conversation here
        {
          role: "user",
          parts: [{ text: userMessage }] // Your dynamic message
        }
      ]
    })
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent", 
      options
    );
    const data = await response.json();

    if (data.candidates && data.candidates[0].content) {
      const assistantText = data.candidates[0].content.parts[0].text;
      console.log("Assistant:", assistantText);
      return assistantText;
    } else {
      console.error("Unexpected API response structure:", data);
    }
  } catch (err) {
    console.error("API Call Error:", err);
  }
};

export default getResponse;