// BookDetail.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./BookDetail.css"
import SideBarRecommendBook from '../sideBarRecommendBook/SideBarRecommendBook';

const BookDetail = ({ userID, isbn }) => {
  const [bookInfo, setBookInfo] = useState(null);
  const [selectedIsbn, setSelectedIsbn] = useState(isbn);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/books/${selectedIsbn}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBookInfo(data.Book);
      } catch (error) {
        console.error('Error fetching book info:', error);
      }
    };

    if (selectedIsbn) {
      fetchBookInfo();
    }
  }, [selectedIsbn]);

  if (!bookInfo) {
    return null; 
  }

  const handleBookClick = (newIsbn) => {
    setSelectedIsbn(newIsbn);
    // navigate(`/home/recommend/${newIsbn}`);
  };

  return (
    <div className='recommend-content'>
      <div className='book-detail'>
        <h2>Book Details</h2>
        <p>ISBN: {bookInfo['ISBN']}</p>
        <p>Title: {bookInfo['Book-Title']}</p>
        <p>Author: {bookInfo['Book-Author']}</p>
        <p>Publisher: {bookInfo['Publisher']}</p>
        <p>Year of Publication: {bookInfo['Year-Of-Publication']}</p>
        <img src={bookInfo['Image-URL-L']} alt="Book cover" />
      </div>
      
      <div className="sidebar">
          <SideBarRecommendBook userID={userID} productID={selectedIsbn} onBookClick={handleBookClick} />
      </div>
    </div>
  );
};

export default BookDetail;
