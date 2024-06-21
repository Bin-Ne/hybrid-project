import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import "./Home.css";
import Header from "~/components/header/Header";
import Recommend from "../recommend/Recommend";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  // Lấy userID về từ component Login
  const location = useLocation();
  const userID = location.state ? location.state.userID : null;

  // State để lưu từ khóa và kết quả tìm kiếm
  const [searchResults, setSearchResults] = useState([]);


  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/books");
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        const shuffledBooks = shuffleArray(data.Books);
        setBooks(shuffledBooks.slice(0, 20));
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  // Random để hiển thị Books
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleBookClick = (isbn) => {
    setSelectedBook(isbn);
    navigate(`/home/recommend/${isbn}`, { state: { userID, isbn } });
  };

  const toggleFavorite = (isbn) => {
    let updatedFavorites = [...favorites];
    if (updatedFavorites.includes(isbn)) {
      // Remove from favorites
      updatedFavorites = updatedFavorites.filter((item) => item !== isbn);
    } else {
      // Add to favorites
      updatedFavorites.push(isbn);
    }
    setFavorites(updatedFavorites);
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Xử lí tìm kiếm
  const handleSearch = (term) => {
    if (term.trim() === '') {
      setSearchResults([]);
    } else {
      const filteredBooks = books.filter((book) =>
        book.ISBN.toLowerCase().includes(term.toLowerCase()) ||
        book["Book-Title"].toLowerCase().includes(term.toLowerCase()) ||
        book["Book-Author"].toLowerCase().includes(term.toLowerCase()) ||
        book["Year-Of-Publication"].toString().includes(term) ||
        book.Publisher.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filteredBooks);
    }
  };

  return (
    <div className="home-container">
      <Header userID={userID} onSearch={handleSearch} />
      <h1 className="title-home">Home Page</h1>
      {selectedBook ? (
        <Recommend isbn={selectedBook} userID={userID} />
      ) : (
        <div className="books-container">
          {(searchResults.length > 0 ? searchResults : books).map((book, index) => (
            <div
              key={index}
              className="book-card-link"
              onClick={() => handleBookClick(book.ISBN)}
            >
              <div className="book-card">
                <p className="book-title">
                  <strong>Title:</strong> {book["Book-Title"]}
                </p>
                <img
                  src={book["Image-URL-L"]}
                  alt={book["Book-Title"]}
                  className="book-image"
                />
                <div className="book-details">
                  
                  <p>
                    <strong>Author:</strong> {book["Book-Author"]}
                  </p>
                  <p>
                    <strong>Year:</strong> {book["Year-Of-Publication"]}
                  </p>
                  <p>
                    <strong>Publisher:</strong> {book.Publisher}
                  </p>
                  <button
                    className={`favorite-button ${
                      favorites.includes(book.ISBN) ? "favorited" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the event from bubbling up to the parent element (div.book-card-link)
                      toggleFavorite(book.ISBN);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHeart}
                      className={`favorite-icon ${
                        favorites.includes(book.ISBN) ? "favorited" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
