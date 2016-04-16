var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

router.get('/mjpeg/:timestamp', function (req, res, next) {
	var timestamp = req.params.timestamp;

	// read files from public/images/capture/<timestamp>/mpjpeg
	var dirPath = "public/images/capture/" + timestamp + "/mjpeg/";
	fs.readdir(dirPath, function (err, files) {
		if (err) {
		throw err;
		}
		else {

			res.writeHead(200, {
				'Content-Type': 'multipart/x-mixed-replace; boundary=myboundary',
				'Cache-Control': 'no-cache',
				'Connection': 'close',
				'Pragma': 'no-cache'
			});
			var stop = false;
			res.connection.on('close', function() { stop = true; });
			var i = 0;
			sendNext();

			function sendNext () {
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
				i = (i+1) % files.length;
				if (!stop) {
					setTimeout(sendNext, 250);
				};	
			}
		}
    });
})

module.exports = router;
