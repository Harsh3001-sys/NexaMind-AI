import "dotenv/config";

const categorizeChat =
    async (message) => {

        try {

            const response =
                await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "x-goog-api-key":
                                process.env
                                    .GEMINI_API_KEY
                        },

                        body:
                            JSON.stringify({

                                contents: [
                                    {
                                        role:
                                            "user",

                                        parts: [
                                            {
                                                text:
                                                    `You are categorizing an educational chat.
                                                    Message:
                                                    "${message}"

                                                    Return ONLY valid JSON.

                                                    Allowed educationLevel values:
                                                    - BTech
                                                    - 11-12
                                                    - School
                                                    - General

                                                    Example output:

                                                    {
                                                    "educationLevel":
                                                    "BTech",

                                                    "subject":
                                                    "DSA"
                                                    }

                                                    No explanation.
                                                    No markdown.
                                                    No code block.`
                                            }
                                        ]
                                    }
                                ]
                            })
                    }
                );

            const data =
                await response.json();

            const rawText =
                data
                    ?.candidates?.[0]
                    ?.content
                    ?.parts?.[0]
                    ?.text
                    ?.trim();

            if (!rawText) {

                return {
                    educationLevel:
                        "General",

                    subject:
                        "General"
                };
            }

            const cleanText =
                rawText
                    .replace(
                        /```json|```/g,
                        ""
                    )
                    .trim();

            return JSON.parse(
                cleanText
            );

        } catch (error) {

            console.log(error);

            return {
                educationLevel:
                    "General",

                subject:
                    "General"
            };
        }
    };

export default categorizeChat;