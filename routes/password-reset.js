var passport = require('passport');


module.exports = function (req, res, next) {
    passport.authenticate('local', sendResponse)(req, res, next);

    function sendResponse(err, user, info) {
        if (err) return next(err);
        // If not authenticated
        if (!user) return res.status(401).json({
            errors: [info.message],
            data: {}
        })

        // Authenticated - Set new password

        req.logIn(user, function (err) {
            if (err) return next(err);
            return res.json({
                errors: [],
                data: {
                    user: user
                }
            })
        });
    };
}