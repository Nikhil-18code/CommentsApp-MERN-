const CommentActions = ({
  c,
  user,
  handleEdit,
  handleDelete,
  handleLike,
  setReplyId,
  fetchReplies
}) => {
  if (!user) return null;

  return (
    <div className="actions">
      <button onClick={() => handleEdit(c)}>Edit</button>
      <button onClick={() => handleDelete(c.commentId)}>Delete</button>
      <button onClick={() => setReplyId(c.commentId)}>Reply</button>
      <button className="toggleLike" onClick={() => handleLike(c.commentId)}>
        Like ({c.likes || 0})
      </button>
      <button onClick={() => fetchReplies(c.commentId)}>
        {c.replies && c.replies.length > 0
          ? "Hide Replies"
          : "View Replies"}
      </button>
    </div>
  );
};

export default CommentActions;