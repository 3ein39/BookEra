const Cart = require("../models/cart");
const Order = require("../models/order");

exports.addToCart = async function(req, res, next) {
    const userId = req.user._id;
    const bookId = req.params.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId });
    }

    // check if book already exists in cart
    if (cart.books.includes(bookId)) {
        req.flash('error', 'Book already exists in cart');
        return res.redirect('back');
    }

    // orders of the user
    const orders = await Order.find({ user: userId });
    // check if user already ordered the book before
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].bought_books.includes(bookId)) {
            req.flash('error', 'You already ordered this book before');
            return res.redirect('back');
        }
    }


    cart.books.push(bookId);
    await cart.save();
    req.flash('success', 'Book added to cart successfully');
    res.redirect('back');
};


// delete book from cart
exports.deleteFromCart = async function(req, res, next) {
    const userId = req.user._id;
    const bookId = req.params.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId });
    }


    cart.books.pull(bookId);
    await cart.save();
    req.flash('success', 'Book removed from cart successfully');
    // refresh the page
    res.redirect('back');
};
