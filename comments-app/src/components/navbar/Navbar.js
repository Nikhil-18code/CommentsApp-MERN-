import { useState } from "react";
import "../../styles/Navbar.css";
import Profile from "../auth/Profile";
import Login from "../auth/Login";
import Register from "../auth/Register";

function Navbar({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  console.log("Navbar user:", user);
  return (
    <>
    <div className="navbar">
      <div className="logo">CommentApp</div>
      <div
        className="profileWrapper"
        onMouseEnter={() => setShowProfile(true)}
        onMouseLeave={() => setShowProfile(false)}
      >
      <div className="username">Hi {user?.username || 'Guest'}</div>
        <div className="profileIcon">👤</div>

        {showProfile && user && (
            <div className="profileDropdown">
                <button onClick={() => setShowProfileModal(true)}>
                View Profile
                </button>
                <button onClick={onLogout}>
                Logout
                </button>
            </div>
        )}
        
        {showProfile && !user && (
            <div className="profileDropdown">
                <button onClick={() => setShowLogin(true)}>
                Login
                </button>

                <button
                onClick={() => setShowRegister(true)}
                className="registerBtn"
                >
                Register
                </button>
            </div>
        )}
      </div>
    </div>

        {showLogin && (
            <div className="modalOverlay" onClick={() => setShowLogin(false)}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <Login
                    onLogin={(userData) => {
                    localStorage.setItem("user", JSON.stringify(userData));
                    setShowLogin(false);
                    window.location.reload(); // quick fix
                    }}
                />
                </div>
            </div>
        )}

        {showRegister && (
        <div className="modalOverlay" onClick={() => setShowRegister(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <Register
                onRegister={() => {
                setShowRegister(false);
                setShowLogin(true);
                }}
            />
            </div>
        </div>
        )}

        {showProfileModal && (
            <div
                className="modalOverlay"
                onClick={() => setShowProfileModal(false)}
            >
                <div
                className="modalContent"
                onClick={(e) => e.stopPropagation()}
                >
                <Profile user={user} onLogout={onLogout} />

                <button
                    onClick={() => setShowProfileModal(false)}
                    style={{ marginTop: "10px", width: "100%" }}
                >
                    Close
                </button>
                </div>
            </div>
        )}
    </>
  );
}

export default Navbar;