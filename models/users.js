var users = [{
    id: 0,
    username: 'rob',
    password: '$2a$10$fzd7h9BAPg4pCKqZu2oDr.k4RokBIVVsAmuBQor.n42EDPASHnGza'
}]

module.exports.findByUsername = function findByUsername(username, cb) {
    setImmediate(function () {
        var user = null;
        users.forEach(function (_user) {
            if (_user.username == username) {
                user = {
                    id: _user.id,
                    username: _user.username,
                    password: _user.password
                }
            }
        });
        return cb(null, user);
    })
}

module.exports.findById = findById;

function findById(id, cb) {
    var user = null;
    users.forEach(function (_user) {
        if (_user.id === id) user = _user;
    })
    return cb(null, user);
}

module.exports.serialize = function (user, done) {
    return done(null, user.id);
};

module.exports.deserialize = function (id, done) {
    var user = null;
    findById(id, function (err, user) {
        if (err) return done(err);
        if (!user) return done();
        return done(null, user);
    })
}