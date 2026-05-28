import "dotenv/config";

const generateTitle =
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
                                                    `Generate a short chat title (maximum 4 words) for this message.Return ONLY the title.
                                                    Message: "${message}"`
                                            }
                                        ]
                                    }
                                ]
                            })
                    });

            const data =
                await response.json();

            return data
                ?.candidates?.[0]
                ?.content
                ?.parts?.[0]
                ?.text
                ?.replace(/["']/g, "")
                ?.trim()

                || message.slice(
                    0,
                    30
                );

        } catch (error) {

            console.log(
                error
            );

            return message
                .slice(0, 30);
        }
    };

export default
    generateTitle;