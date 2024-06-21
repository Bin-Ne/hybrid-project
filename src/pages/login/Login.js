import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css"

const Login = () => {
  const [userIds, setUserIds] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/api/user_ids')
      .then(response => response.json())
      .then(data => setUserIds(data.User_IDs))
      .catch(error => console.error('Error fetching user IDs:', error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userIds.includes(Number(username)) && username === password) {
      navigate('/home', { state: { userID: username } });
    } else {
      setError('Đăng nhập không thành công');
    }
  };

  return (
    <div className="login-container">
      
      <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login Page</h2>
        <div>
          <label>Tên đăng nhập:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;
