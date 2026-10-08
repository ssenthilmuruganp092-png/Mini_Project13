import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

const API_URL = 'http://localhost:5000/books';

function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [book, setBook] = useState({
    title: '',
    author: '',
    genre: 'Technology',
    price: '',
    publisherYear: new Date().getFullYear(),
    rating: 5,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      axios
        .get(`${API_URL}/${id}`)
        .then((res) => {
          setBook({
            title: res.data.title || '',
            author: res.data.author || '',
            genre: res.data.genre || 'Technology',
            price: res.data.price || '',
            publisherYear: res.data.publisherYear || '',
            rating: res.data.rating || 5,
            description: res.data.description || '',
          });
        })
        .catch(() => setError('Failed to load book data.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${id}`, book);
      } else {
        await axios.post(API_URL, book);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving book.');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Card className="stat-card p-4 mx-auto my-4" style={{ maxWidth: '650px' }}>
      <h3 className="fw-bold mb-4 text-center text-primary">
        {isEditing ? '✏️ Update Book Details' : '✨ Add New Book to Catalog'}
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="title">
          <Form.Label className="fw-semibold">Book Title *</Form.Label>
          <Form.Control
            type="text"
            name="title"
            placeholder="e.g. Design Patterns"
            value={book.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="author">
          <Form.Label className="fw-semibold">Author *</Form.Label>
          <Form.Control
            type="text"
            name="author"
            placeholder="e.g. Erich Gamma"
            value={book.author}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="genre">
              <Form.Label className="fw-semibold">Genre</Form.Label>
              <Form.Select name="genre" value={book.genre} onChange={handleChange}>
                <option value="Technology">Technology</option>
                <option value="Fiction">Fiction</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Business">Business</option>
                <option value="Science">Science</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="price">
              <Form.Label className="fw-semibold">Price ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="price"
                placeholder="29.99"
                value={book.price}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="publisherYear">
              <Form.Label className="fw-semibold">Publication Year</Form.Label>
              <Form.Control
                type="number"
                name="publisherYear"
                value={book.publisherYear}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="rating">
              <Form.Label className="fw-semibold">Rating (1 to 5 Stars)</Form.Label>
              <Form.Select name="rating" value={book.rating} onChange={handleChange}>
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4" controlId="description">
          <Form.Label className="fw-semibold">Description / Overview</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            placeholder="Brief summary of the book..."
            value={book.description}
            onChange={handleChange}
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Link to="/" className="btn btn-outline-secondary px-4">
            Cancel
          </Link>
          <Button variant="primary" type="submit" className="px-4 fw-bold">
            {isEditing ? 'Save Changes' : 'Create Book'}
          </Button>
        </div>
      </Form>
    </Card>
  );
}

export default BookForm;