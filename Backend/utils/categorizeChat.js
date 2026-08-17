// import "dotenv/config";

// const categorizeChat =
//     async (message) => {

//         try {

//             const response =
//                 await fetch(
//                     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
//                     {
//                         method: "POST",

//                         headers: {
//                             "Content-Type":
//                                 "application/json",

//                             "x-goog-api-key":
//                                 process.env
//                                     .GEMINI_API_KEY
//                         },

//                         body:
//                             JSON.stringify({

//                                 contents: [
//                                     {
//                                         role:
//                                             "user",

//                                         parts: [
//                                             {
//                                                 text:
//                                                     `You are categorizing an educational chat.
//                                                     Message:
//                                                     "${message}"

//                                                     Return ONLY valid JSON.

//                                                     Allowed educationLevel values:
//                                                     - BTech
//                                                     - 11-12
//                                                     - School
//                                                     - General

//                                                     Example output:

//                                                     {
//                                                     "educationLevel":
//                                                     "BTech",

//                                                     "subject":
//                                                     "DSA"
//                                                     }

//                                                     No explanation.
//                                                     No markdown.
//                                                     No code block.`
//                                             }
//                                         ]
//                                     }
//                                 ]
//                             })
//                     }
//                 );

//             const data =
//                 await response.json();

//             const rawText =
//                 data
//                     ?.candidates?.[0]
//                     ?.content
//                     ?.parts?.[0]
//                     ?.text
//                     ?.trim();

//             if (!rawText) {

//                 return {
//                     educationLevel:
//                         "General",

//                     subject:
//                         "General"
//                 };
//             }

//             const cleanText =
//                 rawText
//                     .replace(
//                         /```json|```/g,
//                         ""
//                     )
//                     .trim();

//             return JSON.parse(
//                 cleanText
//             );

//         } catch (error) {

//             console.log(error);

//             return {
//                 educationLevel:
//                     "General",

//                 subject:
//                     "General"
//             };
//         }
//     };

// export default categorizeChat;

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
                                                    `You are categorizing a user's chat based on its primary context.

                                                    Message:
                                                    "${message}"

                                                    Return ONLY valid JSON.

                                                    Allowed category values:
                                                    - Work
                                                    - Study
                                                    - Projects
                                                    - Personal

                                                    Rules:
                                                    - Work: professional tasks, office work, business, meetings, emails, career-related work.
                                                    - Study: learning, education, courses, exams, tutorials, academic concepts, research for learning.
                                                    - Projects: software development, coding projects, hackathons, personal projects, building products, technical implementations.
                                                    - Personal: general questions, planning, writing, hobbies, entertainment, everyday tasks, or anything that does not clearly fit the other categories.

                                                    Choose exactly ONE category.
                                                    The subject should be specific and meaningful.
                                                    Do not use "General", "General Chat", or similar generic subjects.
                                                    If no specific subject can be identified, use "Other".

                                                    Also identify the main subject/topic of the conversation.

                                                    Example output:

                                                    {
                                                        "category": "Projects",
                                                        "subject": "React"
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
                    category:
                        "Personal",

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
                category:
                    "Personal",

                subject:
                    "General"
            };
        }
    };

export default categorizeChat;