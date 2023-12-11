const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController.js');

const multer = require('multer');
const storage = multer.diskStorage({});
const upload = multer({ storage,
    // allow pdf only
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .pdf format allowed!'));
        }
    },
});
require('dotenv').config();
const path = require('path');




// get all books
router.get('/', bookController.getAllBooks);
// get book by title
router.get('/title/:title', bookController.getBookByTitle);

// get book by author
router.get('/author/:author', bookController.getBookByAuthor);

// get book by publisher
router.get('/publisher/:publisher', bookController.getBookByPublisher);

// get book by category
router.get('/category/:category', bookController.getBookByCategory);

// create book
router.get('/create', bookController.createBook_get);
router.post('/create', upload.single('softCopy') ,bookController.createBook_post);

// update book by id
router.get('/:id/update', bookController.updateBook_get);
router.post('/:id/update', bookController.updateBook_post);

// delete book by id
router.get('/:id/delete', bookController.deleteBook_get);
router.post('/:id/delete', bookController.deleteBook_post);

// get book by id
router.get('/:id', bookController.getBookById);

// export
module.exports = router;
