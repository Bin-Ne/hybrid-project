// Header.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import "./Header.css";

const Header = ({ userID, onSearch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleProfileClick = () => {
    navigate(`/profile/${userID}`);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    onSearch(term); // Gọi hàm tìm kiếm được truyền từ props
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>Elite's Web</h1>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FontAwesomeIcon
          className="search-icon"
          icon={faMagnifyingGlass}
        />
        
      </div>
      <div className="profile-button">
        <FontAwesomeIcon
          className="profile-icon"
          icon={faUserCircle}
          onClick={handleProfileClick}
        />
      </div>
    </header>
  );
};

export default Header;
