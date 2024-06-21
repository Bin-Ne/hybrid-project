// Recommend.js
import Header from '~/components/header/Header';
import './Recommend.css'
import BookDetail from '~/components/bookDetail/BookDetail';
import React from 'react';
import { useLocation } from 'react-router-dom';

const Recommend = () => {
  const location = useLocation();
  const { userID, isbn } = location.state || {};

  return (
    <div className="recommend-container">
      <Header userID={userID} />
      <div className='page-name'>
        <h1>Recommendations Page</h1>
      </div>

      <div className="book-detail">
        <BookDetail userID={userID} isbn={isbn} />
      </div>
    </div>
  );
};

export default Recommend;
