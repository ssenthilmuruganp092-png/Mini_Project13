const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sethil")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("Database connection error:", err));

// Book Schema
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    author: { type: String, required: [true, "Author is required"], trim: true },
    genre: { type: String, default: "Technology" },
    price: { type: Number, min: 0, default: 0 },
    publisherYear: { type: Number, default: new Date().getFullYear() },
    rating: { type: Number, min: 1, max: 5, default: 4 },
    coverImage: { type: String, default: "" },
    description: { type: String, default: "No description provided." },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

// 1. GET DASHBOARD METRICS / STATS
app.get("/books/stats", async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const books = await Book.find();
    
    const uniqueAuthors = new Set(books.map((b) => b.author)).size;
    const totalValue = books.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const avgPrice = totalBooks > 0 ? (totalValue / totalBooks).toFixed(2) : 0;

    res.status(200).json({
      totalBooks,
      uniqueAuthors,
      totalValue: totalValue.toFixed(2),
      avgPrice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. READ ALL BOOKS (With Filter, Search & Sorting)
app.get("/books", async (req, res) => {
  try {
    const { genre, sort, search } = req.query;
    let queryObj = {};

    if (genre && genre !== "All") {
      queryObj.genre = genre;
    }

    if (search) {
      const safeRegex = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      queryObj.$or = [
        { title: { $regex: safeRegex, $options: "i" } },
        { author: { $regex: safeRegex, $options: "i" } },
        { genre: { $regex: safeRegex, $options: "i" } },
      ];
    }

    let query = Book.find(queryObj);

    if (sort === "price-low") query = query.sort({ price: 1 });
    else if (sort === "price-high") query = query.sort({ price: -1 });
    else if (sort === "year-new") query = query.sort({ publisherYear: -1 });
    else if (sort === "title-az") query = query.sort({ title: 1 });
    else query = query.sort({ createdAt: -1 });

    const books = await query.exec();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. READ SINGLE BOOK
app.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. CREATE BOOK
app.post("/books", async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const saved = await newBook.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. UPDATE BOOK
app.put("/books/:id", async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. DELETE BOOK
app.delete("/books/:id", async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));