var ioClient = require('socket.io-client');

var active = false;
var socket = null;

function PiCam(name) {
	var _this = this;
	console.log("Starting PiCam in 5 seconds: " + name);
	setTimeout(function () {ioClient.connect(process.env.CAMERA_SOCKET_ENDPOINT);
		socket = ioClient.connect(process.env.CAMERA_SOCKET_ENDPOINT);
	    socket.on('connect', function () {
	      	socket.on('activate', activate);
	   		socket.on('deactivate', deactivate);
	        console.log("Camera connected, registering " + name);
	        socket.emit('register', {name: name})
	        socket.emit('status', {active: active});
	    });
	}, 5000);
}

function activate() {
	console.log("PiSim: Turning motion detection system on");
	// do all the stuff to enable motion detection
	active = true
	socket.emit('status', {active: active});
}

function deactivate() {
	console.log("PiSim: Turning motion detection system off");
	// disable motion detection
	active = false;
	socket.emit('status', {active: active});
}


module.exports = PiCam;