
var socketIo = require('socket.io');
var Cameras = require('./cameras.js');

function init(server) {
  var io = socketIo(server);
  var controllerIo = io.of('/controller');
  var cameraIo = io.of('/camera');  

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
    if (controller) controller.emit('list', Cameras.list())
  })

  cameraIo.on('connection', function (socket) {
    console.log('Camera connected...');
    socket.on('register', registerCamera(socket));
    socket.on('status', updateStatus(socket));
    socket.on('image', sendImage(socket));
    socket.on('disconnect', function () {
      var camera = Cameras.findBySocket(socket);
      if (camera) {
        camera.setStatus('offline');
        if (controller) controller.emit('list', Cameras.list())
      }
      else {
        console.log("Unable to find camera in collection");
      }
      console.log("Camera disconnected...");
    });
  });

  function sendImage (socket) {
    return function (image) {
      var camera = Cameras.findBySocket(socket);
      if (controller) controller.emit('image', {id: camera.id, src: image.src})
    }
  }
  function updateStatus (socket) {
    return function (message) {
      var camera = Cameras.findBySocket(socket);
      camera.status = message.status;
      console.log("Got status update: status = " + message.status + " for camera: " + camera.name);
      if (controller) controller.emit('status', {id: camera.id, status: camera.status})
    }
  }

  function registerCamera (socket) {
    return function (camera) {
      console.log("Got register event.");
      console.log(camera);
      Cameras.add({name: camera.name, id: camera.id, socket: socket});
      console.log("Sending list event");
      if (controller) controller.emit('list', Cameras.list())
    }
  }
}


module.exports = init;