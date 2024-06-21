// Profile.js
import Recommend from '~/pages/recommend/Recommend';
import './Profile.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const { userID } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [bookDetails, setBookDetails] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavoriteBooks(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        const data = await response.json();
        setBookDetails(data.Books);
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };

    fetchBookDetails();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const isbnArray = favoriteBooks.map(isbn => {
          const book = bookDetails.find(book => book.ISBN === isbn);
          return book ? book.ISBN : null;
        }).filter(isbn => isbn !== null);

        const requests = isbnArray.map(isbn =>
          fetch(`http://localhost:8080/api/recommend_by_favorite_book?productID=${isbn}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch recommendations for ${isbn}`);
              }
              return response.json();
            })
        );

        const recommendationResponses = await Promise.all(requests);
        const recommendedBooks = recommendationResponses.flatMap(response => response.RecommendedBooks);
        setRecommendations(recommendedBooks);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    if (favoriteBooks.length > 0 && bookDetails.length > 0) {
      fetchRecommendations();
    }
  }, [favoriteBooks, bookDetails]);

  // Chuyển hướng tới trang recommend
  const handleBookClick = (isbn) => {
    setSelectedBook(isbn);
    navigate(`/home/recommend/${isbn}`, { state: { userID, isbn } });
  };

  // Cập nhật lại favoriteBooks sau khi click Trash Icon
  const onRemoveFavorite = (isbn) => {
    const updatedFavorites = favoriteBooks.filter(bookISBN => bookISBN !== isbn);
    setFavoriteBooks(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const renderBookDetails = () => {
    return (
      <div className='container-favorite-books'>
        <p className='title-profile'>User's Favorite Books</p>
        <ul className="book-details">
          {favoriteBooks.map((isbn) => {
            const book = bookDetails.find((book) => book.ISBN === isbn);
            if (!book) return null;
            return (
              <li key={isbn} onClick={() => handleBookClick(isbn)}>
                <div>
                  <img src={book['Image-URL-L']} alt={book['Book-Title']} />
                </div>
                <div>
                  <p><strong>Title:</strong> {book['Book-Title']}</p>
                  <p><strong>Author:</strong> {book['Book-Author']}</p>
                  <p><strong>Year:</strong> {book['Year-Of-Publication']}</p>
                  <p><strong>Publisher:</strong> {book['Publisher']}</p>
                </div>
                <div className="trash-icon" onClick={(e) => { e.stopPropagation(); onRemoveFavorite(isbn); }}>
                  <FontAwesomeIcon icon={faTrash} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderRecommendations = () => {
    return (
      <div className='container-recommended-books'>
        <p className='title-profile'>Recommended Books</p>
        <ul className="recommendations">
          {recommendations.map(book => (
            <li key={book.ISBN} onClick={() => handleBookClick(book.ISBN)}>
              <div>
                <img src={book['Image-URL-L']} alt={book['Book-Title']} />
              </div>
              <div>
                <p><strong>Title:</strong> {book['Book-Title']}</p>
                <p><strong>Author:</strong> {book['Book-Author']}</p>
                <p><strong>Year:</strong> {book['Year-Of-Publication']}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <h1>Profile Page</h1>
      {userID ? (
        <div>
          <p>User ID: {userID}</p>
          {/* Display more user information here */}
        </div>
      ) : (
        <p>No user information available.</p>
      )}

      {selectedBook ? (
        <Recommend isbn={selectedBook} userID={userID} />
      ) : (
        favoriteBooks.length > 0 ? (
          <>
            {renderBookDetails()}
            {recommendations.length > 0 ? renderRecommendations() : <p>No recommendations available.</p>}
          </>
        ) : (
          <p>No favorite books added yet.</p>
        )
      )}

    </div>
  );
};

export default Profile;
