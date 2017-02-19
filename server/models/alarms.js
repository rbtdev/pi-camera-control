var db = require('../lib/db');

module.exports.create = function create(alarm, cb) {
    var query = {
        sql: "INSERT into alarms (cameraId, type, timestamp) VALUES \
             ($1, $2, $3);",
        params: [alarm.cameraId, alarm.type, alarm.timestamp]
    }
    db.query(query, function (err, result) {
        if (err) return cb(err);
        return cb(null, result.rows[0]);
    })
}