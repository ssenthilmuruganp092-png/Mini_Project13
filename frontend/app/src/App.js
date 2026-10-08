import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar } from 'react-bootstrap';
import BookList from './components/BookList';
import BookForm from './components/BookForm';

function App() {
  return (
    <Router>
      {/* Navigation Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            📚 Bookstore Management System
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* Main Content & Routes */}
      <Container>
        <Routes>
          {/* Home Route: Displays table of books and search */}
          <Route path="/" element={<BookList />} />

          {/* Add Book Route: Shows form to create new book */}
          <Route path="/add" element={<BookForm />} />

          {/* Edit Book Route: Shows form pre-filled with selected book's data */}
          <Route path="/edit/:id" element={<BookForm />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;