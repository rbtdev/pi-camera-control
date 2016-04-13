var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

router.get('/mjpeg/:timestamp', function (req, res, next) {
	var timestamp = request.params.timestamp;
	console.log("***** GOT MJPEG request for id " +   timestamp);



})

module.exports = router;
