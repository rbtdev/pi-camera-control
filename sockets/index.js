
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

  var controller = null;

  controllerIo.on('connection', function (socket) {
    console.log("Controller connected...");
    //controller = socket;

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
    socket.emit('list', Cameras.list())
  })

  cameraIo.on('connection', function (socket) {
    console.log('Camera connected...');
    socket.on('register', registerCamera(socket));
    socket.on('status', updateStatus(socket));
    ioStream(socket).on('thumbnail', sendImage(socket));
    ioStream(socket).on('frame', readFrame(socket));
    socket.on('alarm', sendAlarm(socket));
    socket.on('disconnect', function () {
      var camera = Cameras.findBySocket(socket);
      if (camera) {
        camera.setStatus('offline');
        controllerIo.emit('status', {id: camera.id, status: camera.status})
      }
      else {
        console.log("Unable to find camera in collection");
      }
      console.log("Camera disconnected...");
    });
  });

  function readFrame(socket) {
    return function (stream, data, cb) {
      console.log("Got frame: " + data.timestamp + "," + data.name);
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
      var filename = path.basename(data.name);
      var localDir =  publicDir + "/" + imageDir + "/capture/" + data.timestamp + "/";
      var url = "/" + imageDir + "/capture/" + data.timestamp + "/" + "thumb_" + filename;
      var fullPath =  publicDir + url;
      try {
        fs.mkdirSync(localDir);
      } catch (e) {
      }
      stream.on('finish', function () {
        var camera = Cameras.findBySocket(socket);
        console.log("URL = " + url);
        controllerIo.emit('thumbnail', {id: camera.id, alarmId: data.timestamp, src: url});
      });
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
      Cameras.add({name: camera.name, id: camera.id, socket: socket});
      console.log("Sending list event");
      controllerIo.emit('list', Cameras.list())
    }
  }
}


module.exports = init;