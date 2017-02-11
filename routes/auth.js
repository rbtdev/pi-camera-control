module.exports = {
    isLoggedIn: {
        api: isLoggedInApi,
        web: isLoggedInWeb
    }
}

function isLoggedInWeb(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

function isLoggedInApi(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            errors: ['Not logged in'],
            data: {}
        });
    }
}