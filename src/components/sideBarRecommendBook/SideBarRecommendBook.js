import React, { useState, useEffect } from 'react';
import './SideBarRecommendBook.css';

const SideBarRecommendBook = ({ userID, productID, onBookClick }) => {   
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const url = `http://localhost:8080/api/recommendation?userId=${userID}&productId=${productID}`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setRecommendations(data.Recommendation_info);
      })
      .catch(error => {
        console.error('Error fetching recommendations:', error);
      });
  }, [userID, productID]);

  return (
    <div className="sidebar">
      <h2>Sidebar Recommended Books</h2>
      <ul className='book-list'>
        {recommendations.map((book, index) => (
          <li key={index} onClick={() => onBookClick(book.ISBN)} className="book-item">
            <img src={book['Image-URL-L']} alt={book['Book-Title']} className="book-image" />
            <div className="book-details">
              <h3 className="book-title">{book['Book-Title']}</h3>
              <p className="book-author">Author: {book['Book-Author']}</p>
              <p className="book-publisher">Publisher: {book['Publisher']}</p>
              <p className="book-year">Year: {book['Year-Of-Publication']}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBarRecommendBook;
