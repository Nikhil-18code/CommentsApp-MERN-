import CommentActions from './CommentActions';

const CommentItem = ({
  c,
  user,
  editId,
  editText,
  setEditText,
  handleUpdate,
  highlightText,
  handleEdit,
  handleDelete,
  handleLike,
  setReplyId,
  fetchReplies,
  replyId,
  replyText,
  setReplyText,
  handleReply,
  renderComments
}) => {

  return (
    <div className="commentCard">
      <div className="commentHeader">
        {c.userName}
      </div>

      {editId === c.commentId ? (
        <>
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <button onClick={() => handleUpdate(c.commentId)}>Save</button>
        </>
      ) : (
        <>
          <p className="commentText">
            {highlightText(c.text, c.suspectWords, c.bannedWords)}
          </p>

          <span>{new Date(c.createdAt).toLocaleString()}</span>

          <CommentActions
            c={c}
            user={user}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleLike={handleLike}
            setReplyId={setReplyId}
            fetchReplies={fetchReplies}
          />

          {replyId === c.commentId && (
            <div className="replyBox">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
              />
              <button onClick={() => handleReply(c.commentId)}>Send</button>
            </div>
          )}

          {c.replies && c.replies.length > 0 && (
            <div className="repliesContainer">
              {renderComments(c.replies)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentItem;