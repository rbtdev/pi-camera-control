var users = require('../models/users');
var bcrypt = require('bcrypt');

module.exports.authenticate = authenticate;
module.exports.isLoggedIn = isLoggedIn;

function authenticate(username, password, done) {
    users.findByUsername(username.trim().toLowerCase(), function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, {
            message: 'Invalid username'
        });
        bcrypt.compare(password, user.password, function (err, match) {
            if (err) return done(err);
            if (!match) return done(null, false, {
                message: 'Incorrect password'
            });
            delete user.password;
            return done(null, user)
        })
    })
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}