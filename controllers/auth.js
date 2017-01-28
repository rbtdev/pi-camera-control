module.exports.authenticate = authenticate;
module.exports.isLoggedIn = isLoggedIn;

function authenticate(username, password, done) {
    if (username !== 'rob') {
        return done(null, false, {
            message: 'Incorrect username'
        });
    }
    if (password !== 'password') {
        return done(null, false, {
            message: 'Incorrect password'
        });
    }
    var user = {
        id: 1,
        username: username
    }
    return done(null, user);
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}