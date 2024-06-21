// SideBarRecommendBook.js
import React, { useState, useEffect } from 'react';

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
      <h2>SidebarRecommended Books</h2>
      <ul>
        {recommendations.map((book, index) => (
          <li key={index} onClick={() => onBookClick(book.ISBN)}>
            <img src={book['Image-URL-S']} alt={book['Book-Title']} />
            <div>
              <h3>{book['ISBN']}</h3>
              <h3>{book['Book-Title']}</h3>
              <p>Author: {book['Book-Author']}</p>
              <p>Publisher: {book['Publisher']}</p>
              <p>Year: {book['Year-Of-Publication']}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBarRecommendBook;
