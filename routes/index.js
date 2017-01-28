var express = require('express');
var passport = require('passport');
var router = express.Router();
var auth = require('../controllers/auth');
var fs = require('fs');

router.get('/login', function (req, res, next) {
	res.sendFile(__dirname + '/login.html');
});

router.post('/login', function (req, res, next) {
	passport.authenticate('local', function (err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(401).json({
				errors: [info.message],
				data: {}
			})
		}
		req.logIn(user, function (err) {
			if (err) {
				return next(err);
			}
			return res.json({
				errors: [],
				data: {
					user: user
				}
			})
		});
	})(req, res, next);
});




/* GET home page. */
router.get('/', auth.isLoggedIn, function (req, res, next) {
	res.sendFile(__dirname + '/index.html');
});

router.get('/mjpeg/:timestamp', function (req, res, next) {
	var timestamp = req.params.timestamp;

	// read files from public/images/capture/<timestamp>/mpjpeg
	var dirPath = "public/images/capture/" + timestamp + "/mjpeg/";
	fs.readdir(dirPath, function (err, files) {
		if (err) {
			throw err;
		} else {

			res.writeHead(200, {
				'Content-Type': 'multipart/x-mixed-replace; boundary=myboundary',
				'Cache-Control': 'no-cache',
				'Connection': 'close',
				'Pragma': 'no-cache'
			});
			var stop = false;
			res.connection.on('close', function () {
				stop = true;
			});
			var i = 0;
			sendNext();

			function sendNext() {
				var filename = files[i];
				var content = fs.readFileSync(dirPath + filename);
				if (content) {
					res.write("--myboundary\r\n");
					res.write("Content-Type: image/jpeg\r\n");
					res.write("Content-Length: " + content.length + "\r\n");
					res.write("\r\n");
					res.write(content, 'binary');
					res.write("\r\n");
				}
				i = (i + 1) % files.length;
				if (!stop) {
					setTimeout(sendNext, 250);
				};
			}
		}
	});
})

module.exports = router;