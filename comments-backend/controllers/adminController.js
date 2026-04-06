const Comment = require('../models/Comment');

// 🔹 Get flagged comments
exports.getFlaggedComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      status: 'under_review'
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Approve
exports.approveComment = async (req, res) => {
  try {
    await Comment.updateOne(
      { commentId: req.params.id },
      { status: 'visible' }
    );

    res.json({ message: "Approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Reject
exports.rejectComment = async (req, res) => {
  try {
    await Comment.updateOne(
      { commentId: req.params.id },
      { status: 'hidden' }
    );

    res.json({ message: "Rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};