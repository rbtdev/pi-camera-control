var passport = require('passport');

module.exports = login;

function login(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                errors: [info.message],
                data: {}
            })
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.json({
                errors: [],
                data: {
                    user: user
                }
            })
        });
    })(req, res, next);
};