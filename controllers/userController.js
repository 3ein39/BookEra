const User = require('../models/user.js');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }),
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
};

// get user by id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        // render the user profile page
        res.render('user_profile', { user });
    } catch (err) {
        res.status(500).json(err);
    }
};

// get user by username
exports.getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

// create user
exports.signup_get = async (req, res) => {
    res.render('signup_form');
};

exports.signup_post = async (req, res) => {
    try {
        const existingUser = await User.findOne({
            username: req.body.username,
        });
        if (existingUser) {
            req.flash('error', 'Username already exists');
            return res.redirect('/users/signup');
        }
        const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
            wallet_amount: 0,
            type: req.body.type,
            address: req.body.address,
        });
        await user.save();
        res.redirect('/users/login');
    } catch (err) {
        req.flash('error', 'An error occurred');
        res.redirect('/users/signup');
    }
};

// update user
exports.updateUser_get = async (req, res) => {
    res.send('update user get');
};

exports.updateUser_post = async (req, res) => {
    res.send('update user post');
};

// delete user
exports.deleteUser_get = async (req, res) => {
    res.send('delete user get');
};

exports.deleteUser_post = async (req, res) => {
    res.send('delete user post');
};

// user login
exports.login_get = async (req, res) => {
    res.render('login_form');
};

exports.login_post = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/users/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            // If login is successful, initialize an empty cart in the session
            req.session.cart = [];
            return res.redirect('/');
        });
    })(req, res, next);
};


// user logout
exports.logout_get = async (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.redirect('/');
    });
};
