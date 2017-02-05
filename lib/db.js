var pg = require('pg');
const url = require('url')
const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true,
    max: 20, //set pool max size to 20 
    min: 4, //set min pool size to 4 
    idleTimeoutMillis: 1000 //close idle clients after 1 second 
};
var pool = new pg.Pool(config);
pg.defaults.ssl = true;

pool.on('error', function (err) {
    console.log('Pool Error: ' + JSON.stringify(err));
})

module.exports.query = function (query, cb) {
    var sql = undefined;
    if (typeof query === 'string') sql = query;
    else if (query.sql) sql = query.sql;
    else return cb(new Error("Invalid query:" + JSON.stringify(query)));
    pool.query(query.sql, query.params, function (err, result) {
        if (err) return cb(err);
        return cb(null, result);
    })
}