// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Recommend from './pages/recommend/Recommend';
import Profile from './components/profile/Profile';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home/recommend/:isbn" element={<Recommend />} />
          <Route path="/profile/:userID" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;





