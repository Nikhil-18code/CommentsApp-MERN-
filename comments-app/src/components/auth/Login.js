import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/Auth.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/login', {
                email,
                password
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onLogin(res.data.user);

        } catch (err) {
            console.log(err.response);
            alert(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
            <h2>Login</h2>

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

            <button onClick={handleLogin}>Login</button>
            </div>
        </div>
);
};

export default Login;