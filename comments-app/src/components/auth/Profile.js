import React from 'react';
import '../../styles/Profile.css';

const Profile = ({ user, onLogout }) => {

    if (!user) {
       return;
    }
    return (
        <div className="profile-card">
            <h2 className="profile-title">My Profile</h2>

            <div className="profile-item">
                <span className="label">Username:</span>
                <span className="value">{user.username}</span>
            </div>
            
            <div className="profile-item">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
            </div>

            <div className="profile-item">
                <span className="label">Role:</span>
                <span className={`badge ${user.role}`}>
                    {user.role}
                </span>
            </div>

            {user.createdAt && (
                <div className="profile-item">
                    <span className="label">Joined:</span>
                    <span className="value">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                </div>
            )}

            {/* Logout Button */}
            <button className="logout-btn" onClick={onLogout}>
                Logout
            </button>
        </div>
    );
};

export default Profile;