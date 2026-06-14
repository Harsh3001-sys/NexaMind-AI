import express from 'express';
import Thread from '../models/Threads.js';
import getResponse from '../utils/gemini.js';
import authMiddleware from '../middleware/authMiddleware.js';
import generateTitle from "../utils/generateTitle.js";
import categorizeChat from '../utils/categorizeChat.js';
import { v1 as uuidv1 } from "uuid";

const router = express.Router();

router.post('/test', async (req, res) => {
    try {
        const thread = new Thread({
            threadID: 'xyz',
            title: '123',
        });
        const response = await thread.save();
        res.send(response);
    } catch (error) {
        console.error('Error in /test route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/thread', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const thread = (await Thread.find({ userId }).sort({ updatedAt: -1 }));
        res.send(thread);
    } catch (error) {
        console.error('Error in  route:', error);
        res.status(500).send('Internal Server Error');
    };
});

router.get('/thread/:threadID', authMiddleware, async (req, res) => {
    const { threadID } = req.params;
    const userId = req.user.id;
    try {
        const thread = await Thread.findOne({ threadID, userId });

        if (!thread) {
            res.status(404).send('Thread not found');
        } else {
            res.send(thread.messages);
        }
    } catch (error) {
        console.error('Error in route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/thread/:threadID', authMiddleware, async (req, res) => {
    const { threadID } = req.params;
    const userId = req.user.id;
    try {
        const deletedThread = await Thread.findOneAndDelete({ threadID, userId });

        if (!deletedThread) {
            res.status(404).send('Thread not found');
        } else {
            res.send({
                message:
                    "Thread deleted successfully"
            });
        }
    } catch (error) {
        console.error('Error in DELETE  route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/chat', authMiddleware, async (req, res) => {
    const { threadID, messages } = req.body;
    const userId = req.user.id;

    if (!threadID || !messages) {
        return res.status(400).send('Required filds are missing');
    }

    try {
        let thread = await Thread.findOne({ threadID, userId });

        if (!thread) {
            const generatedTitle =
                await generateTitle(
                    messages
                );
            const category =
                await categorizeChat(
                    messages
                );
            console.log(generatedTitle);
            thread = new Thread({
                userId,
                threadID,
                title: generatedTitle,
                educationLevel:
                    category.educationLevel,
                subject:
                    category.subject,
                messages: [{ role: 'user', content: messages }],
            });
        } else {
            thread.messages.push({ role: 'user', content: messages });
        }
        const geminiHistory =
            thread.messages
                .slice(
                    Math.max(
                        thread.messages.length - 11,
                        0
                    ),
                    -1
                )
                .map((msg) => ({

                    role:
                        msg.role ===
                            "assistant"
                            ? "model"
                            : "user",

                    parts: [
                        {
                            text:
                                msg.content
                        }
                    ]
                }));
        const assistantReply = await getResponse(messages, geminiHistory);
        if (!assistantReply) {

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "AI response failed"
                });
        }
        thread.messages.push({ role: 'assistant', content: assistantReply });
        thread.updatedAt = Date.now();
        await thread.save();
        res.send({ reply: assistantReply });
    } catch (error) {
        console.error('Error in POST /chat route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post(
    '/thread/share/:threadID', authMiddleware, async (req, res) => {

        const { threadID } = req.params;

        const userId = req.user.id;

        const thread =
            await Thread.findOne({

                threadID,
                userId
            });

        if (!thread) {
            return res
                .status(404)
                .json({
                    message:
                        "Thread not found"
                });
        }

        if (!thread.shareId) {
            thread.shareId =
                uuidv1();

            thread.isShared =
                true;

            await thread.save();
        }

        res.json({

            shareLink:

                `http://localhost:5173/share/${thread.shareId}`

        });
    });


router.get('/share/:shareId', async (req, res) => {

    const { shareId } = req.params;

    const thread =
        await Thread.findOne({
            shareId,
            isShared: true
        });

    if (!thread) {

        return res
            .status(404)
            .json({
                message:
                    "Chat not found"
            });
    }

    res.json({
        title:
            thread.title,

        messages:
            thread.messages
    });
});
export default router;