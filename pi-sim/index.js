var ioClient = require('socket.io-client');


function PiCam (name) {

	this.active = false;
	this.socket = null;
	this.name = name;
}

PiCam.prototype.connect = function () {
	var _this = this;
	this.socket = ioClient.connect(process.env.CAMERA_SOCKET_ENDPOINT);
	this.socket.on('connect', onConnect.bind(this))
}

function onConnect () {
	this.socket.on('activate', onActivate.bind(this));
	this.socket.on('deactivate', onDeactivate.bind(this));
	console.log("Camera connected, registering " + this.name);
	this.socket.emit('register', {name: this.name})
	this.socket.emit('status', {active: this.active});	
}
function onActivate () {
	console.log("PiSim: Turning motion detection system on");
	// do all the stuff to enable motion detection
	this.active = true
	this.socket.emit('status', {active: this.active});
}

function onDeactivate () {
	console.log("PiSim: Turning motion detection system off");
	// disable motion detection
	this.active = false;
	this.socket.emit('status', {active: this.active});
}


module.exports = PiCam;