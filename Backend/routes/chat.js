import express from 'express';
import Thread from '../models/Threads.js';
import getResponse from '../utils/gemini.js';

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

router.get('/thread', async (req, res) => {
    try {
        const thread = (await Thread.find({}).sort({ updatedAt: -1 }));
        res.send(thread);
    } catch (error) {
        console.error('Error in  route:', error);
        res.status(500).send('Internal Server Error');
    };
});

router.get('/thread/:threadID', async (req, res) =>{
    const { threadID } = req.params;
    try{
        const thread = await Thread.findOne({ threadID });

        if(!thread){
            res.status(404).send('Thread not found');
        } else {
            res.send(thread.messages);
        }
    }catch(error){
        console.error('Error in route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/thread/:threadID', async (req, res) =>{
    const { threadID } = req.params;
    try{
        const deletedThread = await Thread.findOneAndDelete({ threadID });

        if(!deletedThread){
            res.status(404).send('Thread not found');
        } else {
            res.send('Thread deleted successfully');
        }
    }catch(error){
        console.error('Error in DELETE  route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/chat', async (req, res) => {
    const {threadID, messages} = req.body;

    if(!threadID || !messages){
        return res.status(400).send('Required filds are missing');
    }

    try{
        const thread = await Thread.findOne({ threadID });

        if(!thread){
            const newThread = new Thread({
                threadID,
                title: message,
                messages: [{role: 'user', content: messages}],
            });
        }else{
            thread.messages.push({role: 'user', content: messages});
        }
        const assistantReply = await getResponse(messages);
        thread.messages.push({role: 'assistant', content: assistantReply});
        thread.updatedAt = Date.now();
        await thread.save();
        res.send({reply: assistantReply});
    }catch(error){
        console.error('Error in POST /chat route:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;