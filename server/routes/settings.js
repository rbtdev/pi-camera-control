var users = require('../models/users');

module.exports.read = function read(req, res, next) {
    users.getSettingsById(req.user.id, function (err, settings) {
        if (err) return next(err);
        return res.json({
            errors: [],
            data: settings
        })
    })
}

module.exports.update = function update(req, res, next) {
    settings = req.body;
    res.json({
        errors: [],
        data: settings
    })
}