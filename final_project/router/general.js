const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (!isValid(username)) {
        return res.status(409).json({
            message: 'Username already exists'
        });
    }

    users.push({ username, password });

    return res.status(201).json({
        message: 'User successfully registered'
    });
});

// Get all books
public_users.get('/', (req, res) => {
    return res.status(200).json(books);
});

// Get a book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;

    if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
        return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(books[isbn]);
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();

    const result = Object.entries(books)
        .filter(([, book]) =>
            book.author.toLowerCase().includes(author)
        )
        .reduce((acc, [isbn, book]) => {
            acc[isbn] = book;
            return acc;
        }, {});

    return res.status(200).json(result);
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();

    const result = Object.entries(books)
        .filter(([, book]) =>
            book.title.toLowerCase().includes(title)
        )
        .reduce((acc, [isbn, book]) => {
            acc[isbn] = book;
            return acc;
        }, {});
        
    return res.status(200).json(result);
});

// Get reviews for a book
public_users.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;

    if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
        return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(books[isbn].reviews);
});

// Axios function: retrieve all books using async/await
async function getAllBooks() {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
}

// Axios function: retrieve a book by ISBN using a Promise
function getBookByISBN(isbn) {
    return axios
        .get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
        .then(response => response.data);
}

// Axios function: retrieve books by author using async/await
async function getBooksByAuthor(author) {
    const response = await axios.get(
        `${BASE_URL}/author/${encodeURIComponent(author)}`
    );
    return response.data;
}

// Axios function: retrieve books by title using a Promise
function getBooksByTitle(title) {
    return axios
        .get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
        .then(response => response.data);
}

// Axios result handler
function respond(res, promise) {
    promise
        .then(data => res.status(200).json(data))
        .catch(error => {
            const status = error.response ? error.response.status : 500;
            const data = error.response
                ? error.response.data
                : { message: 'Request failed' };

            res.status(status).json(data);
        });
}

// Additional routes demonstrating Axios-based retrieval
public_users.get('/async/books', (req, res) => {
    respond(res, getAllBooks());
});

public_users.get('/async/isbn/:isbn', (req, res) => {
    respond(res, getBookByISBN(req.params.isbn));
});

public_users.get('/async/author/:author', (req, res) => {
    respond(res, getBooksByAuthor(req.params.author));
});

public_users.get('/async/title/:title', (req, res) => {
    respond(res, getBooksByTitle(req.params.title));
});

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;