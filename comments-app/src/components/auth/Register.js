import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/Auth.css';

const Register = ({ onRegister }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    const handleRegister = async () => {
        try {
            await axios.post('http://localhost:5000/api/register', {
                username:username,
                email,
                password,
                role
            });
            onRegister();

        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

   return (
  <div className="auth-wrapper">
    <div className="auth-card">
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button onClick={handleRegister}>Register</button>
    </div>
  </div>
);
};

export default Register;