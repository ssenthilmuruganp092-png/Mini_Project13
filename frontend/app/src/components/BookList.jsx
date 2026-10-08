import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Modal,
  ButtonGroup,
} from 'react-bootstrap';

const API_URL = 'http://localhost:5000/books';

function BookList() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, uniqueAuthors: 0, totalValue: 0, avgPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchBooksAndStats = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (genreFilter !== 'All') queryParams.append('genre', genreFilter);
      if (sortBy) queryParams.append('sort', sortBy);

      const [booksRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}?${queryParams.toString()}`),
        axios.get(`${API_URL}/stats`),
      ]);

      setBooks(booksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksAndStats();
  }, [genreFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooksAndStats();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/${deleteId}`);
      setDeleteId(null);
      fetchBooksAndStats();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (books.length === 0) return;
    const headers = ['Title,Author,Genre,Price,Year,Rating\n'];
    const rows = books.map(
      (b) => `"${b.title}","${b.author}","${b.genre}",${b.price || 0},${b.publisherYear || ''},${b.rating || 5}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bookstore_Catalog.csv';
    a.click();
  };

  return (
    <div>
      {/* 1. TOP ANALYTICS DASHBOARD */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="stat-card p-3">
            <div className="text-muted small fw-bold">TOTAL INVENTORY</div>
            <h3 className="fw-bold mt-1 text-primary">{stats.totalBooks}</h3>
            <span className="small text-success">📚 Books Cataloged</span>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="stat-card p-3">
            <div className="text-muted small fw-bold">TOTAL CATALOG VALUE</div>
            <h3 className="fw-bold mt-1 text-success">${stats.totalValue}</h3>
            <span className="small text-muted">Avg: ${stats.avgPrice} / book</span>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="stat-card p-3">
            <div className="text-muted small fw-bold">UNIQUE AUTHORS</div>
            <h3 className="fw-bold mt-1 text-dark">{stats.uniqueAuthors}</h3>
            <span className="small text-info">✍️ Contributing Writers</span>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="stat-card p-3 d-flex justify-content-center">
            <Link to="/add" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm">
              + Add New Book
            </Link>
          </Card>
        </Col>
      </Row>

      {/* 2. CONTROLS BAR: SEARCH, FILTERS, VIEW TOGGLE */}
      <Card className="p-3 mb-4 stat-card">
        <Row className="g-2 align-items-center">
          <Col md={4}>
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search title, author, genre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="primary" type="submit">
                  Search
                </Button>
                {search && (
                  <Button variant="outline-secondary" onClick={() => { setSearch(''); fetchBooksAndStats(); }}>
                    ✕
                  </Button>
                )}
              </InputGroup>
            </Form>
          </Col>

          <Col md={3}>
            <Form.Select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
              <option value="All">All Genres</option>
              <option value="Technology">Technology</option>
              <option value="Fiction">Fiction</option>
              <option value="Self-Help">Self-Help</option>
              <option value="Business">Business</option>
              <option value="Science">Science</option>
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Sort by: Newest Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Publication Year</option>
              <option value="title-az">Title: A to Z</option>
            </Form.Select>
          </Col>

          <Col md={2} className="text-end">
            <ButtonGroup className="me-2">
              <Button
                variant={viewMode === 'grid' ? 'dark' : 'outline-dark'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'dark' : 'outline-dark'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </ButtonGroup>
            <Button variant="outline-success" size="sm" onClick={exportToCSV} title="Export to CSV">
              📥 CSV
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 3. CONTENT AREA */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading your bookstore...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center my-5 p-5 bg-white rounded-3 shadow-sm">
          <h4>No books matched your criteria</h4>
          <p className="text-muted">Try resetting your search filters or add a new book.</p>
          <Link to="/add" className="btn btn-primary mt-2">
            + Add First Book
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <Row className="g-4">
          {books.map((book) => (
            <Col md={6} lg={4} key={book._id}>
              <Card className="book-card p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="primary" className="badge-genre">
                      {book.genre || 'General'}
                    </Badge>
                    <span className="fw-bold text-success fs-5">
                      ${book.price ? Number(book.price).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{book.title}</h5>
                  <p className="text-muted small mb-2">by <span className="fw-semibold">{book.author}</span></p>
                  <p className="text-secondary small text-truncate-2 mb-3" style={{ minHeight: '40px' }}>
                    {book.description || 'No summary available.'}
                  </p>
                </div>

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
                    <span className="small text-muted">Year: <strong>{book.publisherYear || 'N/A'}</strong></span>
                    <span className="small text-warning">★ {book.rating || 5}.0</span>
                  </div>

                  <div className="d-flex gap-2">
                    <Button variant="outline-info" size="sm" className="flex-fill" onClick={() => setSelectedBook(book)}>
                      Details
                    </Button>
                    <Link to={`/edit/${book._id}`} className="btn btn-outline-warning btn-sm flex-fill">
                      Edit
                    </Link>
                    <Button variant="outline-danger" size="sm" onClick={() => setDeleteId(book._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        /* TABLE VIEW */
        <div className="table-custom">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Price</th>
                <th>Year</th>
                <th>Rating</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td className="fw-bold">{book.title}</td>
                  <td>{book.author}</td>
                  <td><Badge bg="secondary">{book.genre || 'General'}</Badge></td>
                  <td className="fw-bold text-success">${book.price ? Number(book.price).toFixed(2) : '0.00'}</td>
                  <td>{book.publisherYear || '-'}</td>
                  <td className="text-warning">★ {book.rating || 5}.0</td>
                  <td className="text-end">
                    <Button variant="outline-info" size="sm" className="me-1" onClick={() => setSelectedBook(book)}>
                      View
                    </Button>
                    <Link to={`/edit/${book._id}`} className="btn btn-warning btn-sm me-1">
                      Edit
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => setDeleteId(book._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* 4. DETAILS MODAL */}
      <Modal show={Boolean(selectedBook)} onHide={() => setSelectedBook(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{selectedBook?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Author:</strong> {selectedBook?.author}</p>
          <p><strong>Genre:</strong> <Badge bg="primary">{selectedBook?.genre}</Badge></p>
          <p><strong>Price:</strong> ${selectedBook?.price}</p>
          <p><strong>Published:</strong> {selectedBook?.publisherYear}</p>
          <p><strong>Rating:</strong> ★ {selectedBook?.rating} / 5</p>
          <hr />
          <h6>Synopsis / Description:</h6>
          <p className="text-muted">{selectedBook?.description || 'No description provided.'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedBook(null)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* 5. DELETE CONFIRMATION MODAL */}
      <Modal show={Boolean(deleteId)} onHide={() => setDeleteId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to permanently remove this book from your catalog? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default BookList;