var socketIo = require('socket.io');
var ioStream = require('socket.io-stream');
var Cameras = require('./cameras.js');
var path = require('path');
var moment = require('moment');
var Slack = require('slack-node');
var fs = require('fs');

slack = new Slack();
slack.setWebhook(process.env.SLACK_WEBHOOK_URL);


var publicDir = "public";
var imageDir = "images";

function controller(server) {
  var io = socketIo(server);
  var clientIo = io.of('/controller');
  var cameraIo = io.of('/camera');
  var clientCount = 0;
  clientIo.on('connection', clientConnected);
  cameraIo.on('connection', cameraConnected);

  function sendSlackAlert(source, imageUrl) {
    console.log("Image Url = " + imageUrl);
    slack.webhook({
        text: "Motion Detected by " + source + "\n<" + imageUrl + "|Preview>"
      },
      function (err, response) {
        console.log(response);
      });
  }

  function clientConnected(socket) {
    console.log("Controller connected...");
    clientCount++;
    socket.on('activate', activateCamera);
    socket.on('deactivate', deactivateCamera);
    socket.on('speak', sendSpeak);
    socket.on('capture', sendCapture);
    socket.on('disconnect', clientDisconnected)
    socket.emit('list', Cameras.list())
  }

  function clientDisconnected(socket) {
    clientCount--;
  }

  function cameraConnected(socket) {
    console.log('Camera connected...');
    socket.on('register', registerCamera(socket));
    socket.on('status', updateStatus(socket));
    ioStream(socket).on('thumbnail', sendImage(socket));
    ioStream(socket).on('frame', readFrame(socket));
    socket.on('mjpeg', sendMjpeg(socket));
    socket.on('alarm', sendAlarm(socket));
    socket.on('disconnect', disconnectCamera(socket));
  }

  function sendSpeak(message) {
    console.log("Sending speak command " + message);
    var camera = Cameras.findById(message.id);
    if (camera) {
      camera.socket.emit('speak', message.text);
    } else {
      console.log('Err - no such camera');
    }
  }

  function sendCapture(message) {
    console.log("Sending capture event to camera");
    var camera = Cameras.findById(message.id);
    if (camera) {
      camera.socket.emit('capture');
    } else {
      console.log('Err - no such camera');
    }
  }

  function activateCamera(message) {
    console.log("Got activate event");
    var camera = Cameras.findById(message.id);
    if (camera) {
      camera.socket.emit('activate');
    } else {
      console.log("Err- no such camera");
    }
  }

  function deactivateCamera(message) {
    console.log("got deactivate event");
    var camera = Cameras.findById(message.id);
    if (camera) {
      camera.socket.emit('deactivate');
    } else {
      console.log("Err- no such camera");
      socket.send({
        err: "no such camera"
      })
    }
  }

  function sendMjpeg(socket) {
    return function (timestamp) {
      var camera = Cameras.findBySocket(socket);
      var url = "/mjpeg/" + timestamp;
      camera.setMjpegUrl(timestamp, url);
      clientIo.emit('mjpeg', {
        id: camera.id,
        alarmId: timestamp,
        src: url
      });
    }
  }

  function readFrame(socket) {
    return function (stream, data, cb) {
      // save frame in timestamp mjpeg dir
      var filename = path.basename(data.name);
      var localDir = publicDir + "/" + imageDir + "/capture/" + data.timestamp + "/mjpeg/";
      var fullPath = localDir + filename;
      stream.on('finish', function () {});
      stream.pipe(fs.createWriteStream(fullPath, {
        mode: "0666"
      }));
    }
  }

  function sendAlarm(socket) {
    return function (alarm) {
      var camera = Cameras.findBySocket(socket);
      camera.addAlarm({
        type: alarm.type,
        timestamp: alarm.timestamp
      })
      clientIo.emit('alarm', {
        id: camera.id,
        type: alarm.type,
        timestamp: alarm.timestamp
      });
    }
  }

  function sendImage(socket) {
    return function (stream, data, cb) {
      var camera = Cameras.findBySocket(socket);
      var filename = "thumb_" + path.basename(data.name);
      var localDir = publicDir + "/" + imageDir + "/capture/" + data.timestamp + "/";
      var url = createThumbnailUrl(data.timestamp, filename);
      camera.setThumbnailUrl(data.timestamp, url);
      var fullPath = publicDir + url;
      try {
        fs.mkdirSync(localDir);
        fs.mkdirSync(localDir + "/mjpeg");
      } catch (e) {
        return console.log("Error creating directories.");
      }
      stream.on('finish', function () {
        clientIo.emit('thumbnail', {
          id: camera.id,
          alarmId: data.timestamp,
          src: url
        });
        sendSlackAlert(camera.name, "https://pi-control.herokuapp.com/" + url);
      });
      stream.on('error', function () {
        return console.log("Steam error - " + fullPath)
      });
      stream.pipe(fs.createWriteStream(fullPath, {
        mode: "0666"
      }));
    }
  }

  function updateStatus(socket) {
    return function (message) {
      var camera = Cameras.findBySocket(socket);
      camera.status = message.status;
      clientIo.emit('status', {
        id: camera.id,
        status: camera.status
      })
    }
  }

  function registerCamera(socket) {
    return function (camera) {
      var existingCamera = Cameras.findById(camera.id);
      if (existingCamera) {
        existingCamera.socket = socket;
      } else {
        Cameras.add({
          name: camera.name,
          id: camera.id,
          socket: socket
        });
      }
      clientIo.emit('list', Cameras.list())
    }
  }

  function disconnectCamera(socket) {
    return function () {
      var camera = Cameras.findBySocket(socket);
      if (camera) {
        camera.setStatus('offline');
        clientIo.emit('status', {
          id: camera.id,
          status: camera.status
        })
      } else {
        console.log("Unable to find camera in collection");
      }
      console.log("Camera disconnected");
    }
  }

  function createThumbnailUrl(alarmId, filename) {
    var url = "/" + imageDir + "/capture/" + alarmId + "/" + filename;
    return url;
  }
}

module.exports = controller;