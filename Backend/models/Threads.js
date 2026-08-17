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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
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
    isShared: {
        type: Boolean,
        default: false
    },

    shareId: {
        type: String,
        default: null
    },

    category: {
        type: String,
        enum: [
            "Work",
            "Study",
            "Projects",
            "Personal"
        ],
        default: "General"
    },

    subject: {
        type: String,
        default: "General"
    }
});

export default mongoose.model("Thread", ThreadSchema);