import React, { useState, useEffect } from 'react';
import axios from 'axios';
const CommentItem = React.lazy(() => import('./CommentItem'));

const API_URL = 'http://localhost:5000/api/comments';

const CommentBox = ({ user, onLogout }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  const handleLike = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      //Update like count in UI without refetching all comments
      const updateLikes = (list) =>
      list.map(c => {
        if (c.commentId === commentId) {
          return { ...c, likes: res.data.likes };
        }
        if (c.replies) {
          return { ...c, replies: updateLikes(c.replies) };
        }
        return c;
      });

      setComments(prev => updateLikes(prev));

    } catch (err) {
      console.log(err);
    }
};

  // ✅ Fetch comments with pagination and sorting
  const fetchComments = async (pageNumber = 1, sort = sortBy) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}?page=${pageNumber}&limit=5&sortBy=${sort}`
      );
      const { data, pageInfo } = res.data;
      if (pageNumber === 1) {
          setComments(data);
        } else {
          setComments(prev => [...prev, ...data]);
        }
      setHasNextPage(pageInfo.hasNextPage);

    } catch (err) {
      console.log(err);
    } finally{
      setLoading(false)
    }
  };

 const fetchReplies = async (commentId) => {
  try {
    // Step 1: check if replies already exist
    let alreadyLoaded = false;

    const checkReplies = (list) => {
      for (let c of list) {
        if (c.commentId === commentId) {
          if (c.replies && c.replies.length > 0) {
            alreadyLoaded = true;
          }
        }
        if (c.replies) checkReplies(c.replies);
      }
    };

    checkReplies(comments);

    // 🔴 CASE 1: Already loaded → HIDE
    if (alreadyLoaded) {
      const hideReplies = (list) =>
        list.map(c => {
          if (c.commentId === commentId) {
            return { ...c, replies: [] };
          }
          if (c.replies) {
            return { ...c, replies: hideReplies(c.replies) };
          }
          return c;
        });

      setComments(prev => hideReplies(prev));
      return;
    }

    // 🟢 CASE 2: Not loaded → FETCH
    const res = await axios.get(`${API_URL}/${commentId}/replies`);

    const attachReplies = (list) =>
      list.map(c => {
        if (c.commentId === commentId) {
          return { ...c, replies: res.data };
        }
        if (c.replies) {
          return { ...c, replies: attachReplies(c.replies) };
        }
        return c;
      });

    setComments(prev => attachReplies(prev));

  } catch (err) {
    console.log(err);
  }
};

  // ✅ Fetch total comments (only parents)
  const fetchTotalComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/count`);
      setTotalComments(res.data.totalComments);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchComments(1,sortBy);
    fetchTotalComments();
  }, []);

  // ✅ Add comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(API_URL, { text: comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { suspect, banned, suspectWords, bannedWords } = res.data;

      if (suspect) alert(`Suspect words: ${suspectWords.join(', ')}`);
      if (banned) alert(`Banned words: ${bannedWords.join(', ')}`);

      // Prepend new comment to UI without refetching all comments
      setComments(prev => [res.data.data, ...prev]);
      setComment('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding comment');
    }
  };

  // ✅ Reply (supports infinite nesting)
  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(API_URL, {
        text: replyText,
        parentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

       const newReply = res.data.data;

    // ✅ attach reply in correct place in UI without refetching all comments
    const attachReply = (list) =>
      list.map(c => {
        if (c.commentId === parentId) {
          return {
            ...c,
            replies: c.replies ? [...c.replies, newReply] : [newReply]
          };
        }
        if (c.replies) {
          return {
            ...c,
            replies: attachReply(c.replies)
          };
        }
        return c;
      });

      setComments(prev => attachReply(prev));
      setReplyText('');
      setReplyId(null);
    } catch (err) {
      console.log(err);
    }
  };
  

  // ✅ Delete
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      //Remove deleted comment and its nested replies from UI
      const removeComment = (list) => list.filter(c => c.commentId !== id).map(c =>({
        ...c,
        replies: c.replies ? removeComment(c.replies) : []
      }));
      setComments(prev => removeComment(prev));
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Edit
  const handleEdit = (c) => {
    const isOwner =user && c.userId?.toString() === user?.userId?.toString();
    const createdAt = new Date(c.createdAt);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    const canEditTime = diffInMinutes <= 1;
    if (!isOwner && !canEditTime) return;
    setEditId(c.commentId);
    setEditText(c.text);
  };

  // ✅ Update
  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/${id}`, { text: editText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditId(null);
      setEditText('');
      setPage(1);
      fetchComments(1,sortBy);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 Load more
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage,sortBy);
  };

  // 🔥 Sorting
  const handleSortChange = async (e) => {
    const value = e.target.value;
    setSortBy(value);
    setPage(1);
    setComments([]);
    await fetchComments(1, value);
  };

  // 🔥 Highlight banned/suspect words
  const highlightText = (text, suspectWords = [], bannedWords = []) => {
    let words = text.split(" ");
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      if (bannedWords.includes(cleanWord)) {
        return <span key={index} style={{ color: "red", fontWeight: "bold" }}>{word} </span>;
      }
      if (suspectWords.includes(cleanWord)) {
        return <span key={index} style={{ backgroundColor: "yellow" }}>{word} </span>;
      }
      return word + " ";
    });
  };

  // 🔥 Recursive renderer
 const renderComments = (list) => {
  return list.map((c) => (
    <CommentItem
      key={c.commentId}
      c={c}
      user={user}
      editId={editId}
      editText={editText}
      setEditText={setEditText}
      handleUpdate={handleUpdate}
      highlightText={highlightText}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      handleLike={handleLike}
      setReplyId={setReplyId}
      fetchReplies={fetchReplies}
      replyId={replyId}
      replyText={replyText}
      setReplyText={setReplyText}
      handleReply={handleReply}
      renderComments={renderComments} // 🔥 important for recursion
    />
  ));
};

  return (
    <div className='mainLayout'>
      <div className='commentSection'>
        <div className="container">
          <div className="card">
            <div className="inputBox">
            {user ? (
              <>
                <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment..."
              />
              <button onClick={handleSubmit}>Submit</button>
              </>
            ): (
              <p style={{ color: "#888" ,textAlign: "center", width: "100%"}}>
                Login to post a comment and reply to others!
              </p>
            )}
            </div>

            <div className="headerRow">
              <h2>All Comments <span>({totalComments})</span></h2>
              <select value={sortBy} onChange={handleSortChange}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="commentsList">
            {loading ? (
              <div className="spinner"></div>
            ) : comments.length === 0 ? (
              <p>No comments yet</p>
            ) : (
              renderComments(comments)
            )}

            </div>

            {hasNextPage && (
              <button className="loadMore" onClick={loadMore}>
                Load More
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentBox;