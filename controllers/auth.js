var users = require('../models/users');

module.exports.authenticate = authenticate;
module.exports.isLoggedIn = isLoggedIn;


function authenticate(username, password, done) {
    users.findByUsername(username, function (err, user) {
        console.log("User lookup: " + JSON.stringify(user, null, 2))
        if (err) return done(err);
        if (!user) return done(null, false, {
            message: 'Invalid username'
        });
        // use bcrypt compare later
        if (password === user.password) {
            delete user.password;
            return done(null, user);
        }
        return done(null, false, {
            message: 'Incorrect password'
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