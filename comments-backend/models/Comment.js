const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    commentId: {
        type: String, 
        unique: true
    },
    text: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        default: "Anonymous"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    parentId: {
        type: String,
        default: null 
    },
    suspectWords: {
        type: [String],
        default: []
    },
    bannedWords: {
        type: [String],
        default: []
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);