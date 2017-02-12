var users = require('../models/users');

module.exports.read = function (req, res, next) {

    users.getProfileById(req.user.id, function (err, profile) {
        if (err) return next(err);
        return res.json({
            errors: [],
            data: profile
        })
    })
}

module.exports.update = function (req, res, next) {
    profile = req.body;
    res.json({
        errors: [],
        data: profile
    });
}