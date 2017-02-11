var profile = {
    user: {
        name: "Rob Thuleen",
        email: "rob.thuleen@gmail.com",
        avatar: 'https://ca.slack-edge.com/T03M9UG6B-U03M9UG6D-071637bee8a2-48'
    }
}

module.exports.read = function (req, res, next) {
    res.json({
        errors: [],
        data: profile
    })
}

module.exports.update = function (req, res, next) {
    profile = req.body;
    res.json({
        errors: [],
        data: profile
    });
}