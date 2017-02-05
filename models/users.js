var db = require('../lib/db');

module.exports.findByUsername = function findByUsername(username, cb) {
    var query = {
        sql: "SELECT * from USERS where username = $1",
        params: [username]
    }
    db.query(query, function (err, result) {
        if (err) return cb(err);
        return cb(null, result.rows[0]);
    })
}

module.exports.findById = findById;

function findById(id, cb) {
    var query = {
        sql: "SELECT * from USERS where id = $1",
        params: [id]
    }
    db.query(query, function (err, result) {
        if (err) return cb(err);
        return cb(null, result.rows[0]);
    })
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