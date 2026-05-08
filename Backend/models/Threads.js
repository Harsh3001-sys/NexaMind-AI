import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: {
        enum: ["user", "assistant"],
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: Date,
        default: Date.now,
    },
});

const ThreadSchema = new mongoose.Schema({
    threadID: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        default: "New Chat",
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Thread", ThreadSchema);