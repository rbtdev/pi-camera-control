var settings = {
    notifications: {
        slack: true
    }
}

module.exports.read = function read(req, res, next) {
    res.json({
        errors: [],
        data: settings
    });
}

module.exports.update = function update(req, res, next) {
    settings = req.body;
    res.json({
        errors: [],
        data: settings
    })
}