import CommentBox from './components/comments/CommentBox';
import { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("App useEffect - storedUser:", storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };
  return (
    <div className="authContainer">
     <Navbar user={user} onLogout={handleLogout} />
    <CommentBox user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;
