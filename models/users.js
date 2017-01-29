var users = [{
    id: 0,
    username: 'rob',
    password: 'password'
}]

module.exports.findByUsername = function (username, cb) {
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