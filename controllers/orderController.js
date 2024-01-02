const Order = require('../models/order');
const Cart = require('../models/cart');
const User = require('../models/user');
const Book = require('../models/book');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Display list of all Orders.
exports.order_list = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate(
            'books',
        );
        const user = await User.findById(req.user._id);

        let wallet_amount = user.wallet_amount;
        let total_price = 0;
        cart.books.forEach((book) => {
            total_price += book.price;
        });

        // render checkout view
        res.render('checkout', { cart, total_price, wallet_amount });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

// Handle Order create on POST.
exports.order_create_post = async (req, res) => {
    try {
        console.log('Creating order');
        const cart = await Cart.findOne({ user: req.user._id }).populate(
            'books',
        );

        if (!cart || !Array.isArray(cart.books)) {
            res.status(400).send('Cart is not properly defined');
            return;
        }

        const stripe_session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: cart.books.map((book) => {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: book.title,
                        },
                        unit_amount: Math.round(book.price * 100),
                    },
                    quantity: 1,
                };
            }),
            success_url: `${process.env.DOMAIN}/orders/mybooks`,
            cancel_url: `${process.env.DOMAIN}/orders/`,
        });

        let total_price = 0;
        for (let book of cart.books) {
            total_price += book.price;
        }

        const order = new Order({
            user: req.user._id,
            bought_books: cart.books.map((book) => book._id),
            total_price: total_price, // Ensure total_price is defined
            order_date: Date.now(),
        });

        await order.save();

        // Update book quantities
        for (let book of cart.books) {
            book.quantity -= 1;
            await book.save();
        }

        // Clear the user's cart
        cart.books = [];
        await cart.save();

        
        res.json({ url: stripe_session.url });
        req.flash('success', 'Order placed successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).json(err);
    }
};

// Display list of all books bought by the user.
exports.order_mybooks = async (req, res) => {
    try {
        let books;
        if (req.user.type === 'buyer') {
            const orders = await Order.find({ user: req.user._id }).populate(
                'bought_books',
            );
            books = orders.flatMap((order) => order.bought_books);
        } else if (req.user.type === 'seller') {
            books = await Book.find({ seller: req.user._id });
        }

        // Loop over each book and populate
        books = await Promise.all(
            books.map(async (book) => {
                return await Book.populate(book, [
                    { path: 'authors' },
                    { path: 'publisher', select: 'name' },
                    { path: 'categories', select: 'name' },
                ]);
            }),
        );

        res.render('mybooks', { books: books });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};