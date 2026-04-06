const Comment = require('../models/Comment');
const Settings = require('../models/Settings');
const User = require('../models/User');


// Utility function to generate unique comment IDsbcrypt
const generateUniqueId = () => {
    return "CMT-" + Date.now();
}

// 🔹 GET COMMENTS (with pagination + sorting)
exports.getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sortBy = req.query.sortBy || 'newest';

    const skip = (page - 1) * limit;

    let sortOption = sortBy === 'newest'
      ? { createdAt: -1 }
      : { createdAt: 1 };

    // Only parent comments
    const parentComments = await Comment.find({ parentId: null })
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const parentIds = parentComments.map(c => c.commentId);

    // Fetch replies (optional use later)
    const replies = await Comment.find({
      parentId: { $in: parentIds }
    });

    const commentsWithReplies = parentComments.map(parent => ({
      ...parent.toObject(),
      replies: [],
      hasReplies: true
    }));

    const totalComments = await Comment.countDocuments({ parentId: null });
    const totalPages = Math.ceil(totalComments / limit);

    res.json({
      data: commentsWithReplies,
      pageInfo: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
     try {
       const user = await User.findById(req.user.id);
       res.json(user);
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
}

exports.createComment = async (req, res) => {
     try {
            const io = req.app.get('io');
            io.emit('newComment', savedComment);
            const {parentId} = req.body;
            const newComment = new Comment({
                text: req.body.text
            });
            if(!newComment.text){
                return res.status(400).json({error: "Comment text is required" });
            }
            if(newComment.text.replace(/\s/g, '').length < 3){
                return res.status(400).json({error: "Comment must be at least 3 characters long" });
            }
            const lowerCaseText = newComment.text.toLowerCase();
            const settings = await Settings.findOne();
            const foundSuspect = settings.suspectWords.filter((word)=> lowerCaseText.includes(word));
            const foundBanned = settings.bannedWords.filter((word)=> lowerCaseText.includes(word));
            const user = await User.findById(req.user.id);
            const isFlagged = foundBanned.length > 0 || foundSuspect.length > 0;
            const newestComment = new Comment({
                commentId: generateUniqueId(),
                text: newComment.text,
                userId: req.user ? req.user.id : null,
                userName: user.username,
                parentId: parentId || null,
                suspectWords: foundSuspect,
                bannedWords: foundBanned,
                isflagged: isFlagged,
                status: isFlagged ? 'under_review' : 'visible'
            });
            const savedComment = await newestComment.save();
            res.json({
                data:savedComment,
                suspect: foundSuspect.length > 0,
                banned: foundBanned.length > 0,
                suspectWords:foundSuspect,
                bannedWords:foundBanned
            })
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
}

exports.getCommentsCount = async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments({ parentId: null });
    res.json({ totalComments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 GET REPLIES
exports.getReplies = async (req, res) => {
  try {
    const replies = await Comment.find({
      parentId: req.params.id
    }).sort({ createdAt: 1 });
    const io = req.app.get('io');
    io.emit('newReply', savedComment);
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Like/Unlike a comment
exports.toggleLike = async (req, res) => {
     try {
        const comment = await Comment.findOne({ commentId: req.params.id });
        if (!comment) {
          return res.status(404).json({ error: "Comment not found" });
        }
        const userId = req.user.id;
        const alreadyLiked = comment.likedBy.some(id => id.toString() === userId);
        if (alreadyLiked) {
          // Unlike
          comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
          comment.likes -= 1;
        } else {
          //  Like
          comment.likedBy.push(userId);
          comment.likes += 1;
        }
    
        await comment.save();
    
        res.json({
          likes: comment.likes,
          liked: !alreadyLiked
        });
    
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

//   Update a comment
exports.updateComment = async (req, res) => {
     try {
            const comment = await Comment.findOne({ commentId: req.params.id });
            if(!comment){
                return res.status(404).json({ error: "Comment not found" });
            }
            if(comment.userId.toString() !== req.user.id && req.user.role !== 'admin'){
                return res.status(403).json({ error: "Unauthorized" });
            }
            const now = new Date();
            const createdAt = new Date(comment.createdAt);
            const diffInMinutes = (now - createdAt) / (1000 * 60);
            if (diffInMinutes > 1) {
            return res.status(403).json({
                error: "Edit time expired (30 minutes limit)"
            });
            }
            const updated = await Comment.updateOne(
                { commentId: req.params.id },
                { text: req.body.text },
                { new: true }
            );
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
}

// Delete a comment
exports.deleteComment = async (req, res) => {
     try {
            const comment = await Comment.findOne({ commentId: req.params.id });
            if(!comment){
                return res.status(404).json({ error: "Comment not found" });
            }
            if(comment.userId.toString() !== req.user.id && req.user.role !== 'admin'){
                return res.status(403).json({ error: "Unauthorized" });
            }
            await Comment.deleteOne({ commentId: req.params.id });
            res.json({ message: "Deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
}