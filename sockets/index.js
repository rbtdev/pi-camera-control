module.exports = function (server) {
  var io = require('socket.io')(server);
  var controllerIo = io.of('/controller');
  var cameraIo = io.of('/camera');

  function Cameras () {
    this.id = 0;
    this._cameras = {};
  }

  Cameras.prototype.add = function (camera) {
    camera.id = this.id;
    this._cameras[this.id.toString()] = camera;
    this.id++;
  }

  Cameras.prototype.findById = function (id) {
    return this._cameras[id];
  }

  Cameras.prototype.findBySocket = function (socket) {
    for (var cameraId in this._cameras) {
      if (this._cameras[cameraId].socket === socket) {
        return (this._cameras[cameraId]);
      }
    }
  }

  Cameras.prototype.remove = function (camera) {
    if (this._cameras[camera.id]) {
      delete (this._cameras[camera.id]);
    }
    else {
      console.log("Cannot remove camera: " + camera)
    }
  }
  Cameras.prototype.toArray = function () {
    var array = [];

    for (var cameraId in this._cameras) {
      array.push({id: cameraId, name: this._cameras[cameraId].name, active: this._cameras[cameraId].active});
    }
    return array;
  }

  function Camera (name, socket) {
    this.name = name;
    this.socket = socket;
    this.active = false;
  }

  var Cameras = new Cameras();
  var controller = null;

  controllerIo.on('connection', function (socket) {
    console.log("Controller connected...");
    controller = socket;

    socket.on('activate', function(message) {
      console.log("Got activate event");
      var camera = Cameras.findById(message.id);
      if (camera) {
        camera.socket.emit('activate');
      }
      else {
        console.log("Err- no such camera");
        socket.send({err: "no such camera"})
      }
    });

    socket.on('deactivate', function (message) {
        console.log("got deactivate event");
        var camera = Cameras.findById(message.id);
        if (camera) {
          camera.socket.emit('deactivate');
        }
        else {
          console.log("Err- no such camera");
          socket.send({err: "no such camera"})
        }
    });
    socket.on('disconnect', function () {

    })

    console.log("Send camera list...");
    if (controller) controller.emit('list', Cameras.toArray())
  })

  cameraIo.on('connection', function (socket) {
    console.log('Camera connected...');
    socket.on('register', registerCamera(socket));
    socket.on('status', updateStatus(socket));
    socket.on('disconnect', function () {
      var camera = Cameras.findBySocket(socket);
      if (camera) {
        Cameras.remove(camera);
      }
      else {
        console.log("Unable to remove camera from collection");
      }
      console.log("Camera disconnected...");
    });
  });

  function updateStatus (socket) {
    return function (message) {
      var camera = Cameras.findBySocket(socket);
      camera.active = message.active;
      console.log("Got status update: active = " + message.active + " for camera: " + camera.name);
      if (controller) controller.emit('status', {id: camera.id, active: camera.active})
    }
  }

  function registerCamera (socket) {
    return function (message) {
      console.log("Got register event.");
      console.log(message);
      var name = message.name;
      var camera = new Camera(name, socket);
      Cameras.add(camera);
      console.log("Sending list event");
      if (controller) controller.emit('list', Cameras.toArray())
    }
  }

 var PiSim = require('../pi-sim');
 setTimeout(function () {
  new PiSim('camera1').connect();
  new PiSim('camera2').connect();
  new PiSim('camera3').connect();
  new PiSim('camera4').connect();
  new PiSim('camera5').connect();
  new PiSim('camera6').connect();
 }, 5000)

}