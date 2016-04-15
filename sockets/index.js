
var socketIo = require('socket.io');
var ioStream = require('socket.io-stream');
var Cameras = require('./cameras.js');
var path = require('path');
var moment = require('moment');

var fs = require('fs');
var publicDir = "public";
var imageDir= "images";

function init(server) {
  var io = socketIo(server);
  var controllerIo = io.of('/controller');
  var cameraIo = io.of('/camera');  

  var controllerCount = 0;

  controllerIo.on('connection', function (socket) {
    console.log("Controller connected...");
    controllerCount++;
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
      controllerCount--;
      console.log("Connected controllers = " + controllerCount);
    })

    console.log("Send camera list...");
    console.log(Cameras.list());
    socket.emit('list', Cameras.list())
  })

  cameraIo.on('connection', function (socket) {
    console.log('Camera connected...');
    socket.on('register', registerCamera(socket));
    socket.on('status', updateStatus(socket));
    ioStream(socket).on('thumbnail', sendImage(socket));
    ioStream(socket).on('frame', readFrame(socket));
    socket.on('mjpeg', sendMjpeg(socket));
    socket.on('alarm', sendAlarm(socket));
    socket.on('disconnect', disconnectCamera(socket));
  });

  function sendMjpeg(socket) {
    return function (timestamp) {
      var camera = Cameras.findBySocket(socket);
      var url = "/mjpeg/" + timestamp;
      camera.setMjpegUrl(timestamp, url);
      controllerIo.emit('mjpeg', {id: camera.id, alarmId: timestamp, src: url});
    }
  }

  function readFrame(socket) {
    return function (stream, data, cb) {
      console.log("Got frame: " + data.timestamp + "," + data.name);
      // save frame in timestamp mjpeg dir
      var filename = path.basename(data.name);
      var localDir =  publicDir + "/" + imageDir + "/capture/" + data.timestamp + "/mjpeg/";
      var fullPath = localDir + filename;
      stream.on('finish', function () {
        console.log("JPEG Frame saved to " + fullPath);
      });
      console.log("Opening write stram to " + fullPath);
      stream.pipe(fs.createWriteStream(fullPath, {mode: "0666"}));
    }
  }

  function sendAlarm(socket) {
    return function (alarm) {
      console.log('Got ' + alarm.type + ' alarm at ' + alarm.timestamp + '. Send to front end.');
      var camera = Cameras.findBySocket(socket);
      camera.addAlarm({type: alarm.type, timestamp: alarm.timestamp})
      controllerIo.emit('alarm', {id: camera.id, type: alarm.type, timestamp: alarm.timestamp});
    }
  };

  function sendImage (socket) {
    return function(stream, data, cb) {
      console.log("Got image upload event. Saving image.");
      var camera = Cameras.findBySocket(socket);
      var filename = "thumb_" + path.basename(data.name);
      var localDir =  publicDir + "/" + imageDir + "/capture/" + data.timestamp + "/";
      var url = createThumbnailUrl(data.timestamp, filename);
      camera.setThumbnailUrl(data.timestamp, url);
      var fullPath =  publicDir + url;
      try {
        fs.mkdirSync(localDir);
        fs.mkdirSync(localDir + "/mjpeg");
      } catch (e) {
        return console.log("Error creating directories.");
      }
      stream.on('finish', function () {
          controllerIo.emit('thumbnail', {id: camera.id, alarmId: data.timestamp, src: url});
      });
      stream.on('error', function () {
        return console.log("Steam error - " + fullPath)
      });
      console.log("Creating frame write stream.");
      stream.pipe(fs.createWriteStream(fullPath, {mode: "0666"}));
    }
  };

  function updateStatus (socket) {
    return function (message) {
      var camera = Cameras.findBySocket(socket);
      camera.status = message.status;
      console.log("Got status update: status = " + message.status + " for camera: " + camera.name);
      controllerIo.emit('status', {id: camera.id, status: camera.status})
    }
  };

  function registerCamera (socket) {
    return function (camera) {
      console.log("Got register event.");
      console.log(camera);
      var existingCamera = Cameras.findById(camera.id);
      console.log("List of cameras = " + JSON.stringify(Cameras.list()));
      console.log("Camera id " + camera.id);
      if (existingCamera) {
        console.log("Existing camera id = " + existingCamera.id);
        console.log("Found camera in camera list " + camera.id);
        existingCamera.socket = socket;
      }
      else {
        Cameras.add({name: camera.name, id: camera.id, socket: socket});
      }
      console.log("Sending list event");
      controllerIo.emit('list', Cameras.list())
    }
  }

  function disconnectCamera (socket) {
    return function () {
      var camera = Cameras.findBySocket(socket);
      if (camera) {
        camera.setStatus('offline');
        controllerIo.emit('status', {id: camera.id, status: camera.status})
      }
      else {
        console.log("Unable to find camera in collection");
      }
      console.log("Camera disconnected...");
    }
  };

  function createThumbnailUrl(alarmId, filename) {
    var url = "/" + imageDir + "/capture/" + alarmId + "/" + filename;
    return url;
  }
}


module.exports = init;