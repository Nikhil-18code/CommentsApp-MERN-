import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [comments, setComments] = useState([]);

  const token = localStorage.getItem('token');

  const fetchFlagged = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/flagged', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setComments(res.data);
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const handleApprove = async (id) => {
    await axios.post(
      `http://localhost:5000/api/admin/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchFlagged();
  };

  const handleReject = async (id) => {
    await axios.post(
      `http://localhost:5000/api/admin/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchFlagged();
  };

  return (
    <div>
      <h2>Flagged Comments</h2>

      {comments.map(c => (
        <div key={c.commentId}>
          <p>{c.text}</p>
          <button onClick={() => handleApprove(c.commentId)}>Approve</button>
          <button onClick={() => handleReject(c.commentId)}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;