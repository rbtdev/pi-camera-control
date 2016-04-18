
var socketIo = require('socket.io');
var ioStream = require('socket.io-stream');
var Cameras = require('./cameras.js');
var path = require('path');
var moment = require('moment');
var Slack = require('slack-node');
var fs = require('fs');
 
slack = new Slack();
slack.setWebhook("https://hooks.slack.com/services/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");


var publicDir = "public";
var imageDir= "images";

function sendSlackAlert(message, imageUrl) {
console.log("Image Url = " + imageUrl);
var attachments = [
        {
            "fallback": imageUrl,
            "thumb_url": imageUrl
        }
    ]
  slack.webhook({
      channel: "#pi-cam",
      username: "pi-cam",
      icon_emoji: ":ghost:",
      title: "",
      text: message,
      attachments: attachments
    }, 
    function(err, response) {
      console.log(response);
    });
}

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
    })
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
      // save frame in timestamp mjpeg dir
      var filename = path.basename(data.name);
      var localDir =  publicDir + "/" + imageDir + "/capture/" + data.timestamp + "/mjpeg/";
      var fullPath = localDir + filename;
      stream.on('finish', function () {
      });
      stream.pipe(fs.createWriteStream(fullPath, {mode: "0666"}));
    }
  }

  function sendAlarm(socket) {
    return function (alarm) {
      var camera = Cameras.findBySocket(socket);
      camera.addAlarm({type: alarm.type, timestamp: alarm.timestamp})
      controllerIo.emit('alarm', {id: camera.id, type: alarm.type, timestamp: alarm.timestamp});
    }
  };

  function sendImage (socket) {
    return function(stream, data, cb) {
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
          sendSlackAlert("Motion Detected", "https://pi-control.herokuapp.com/" + url);
      });
      stream.on('error', function () {
        return console.log("Steam error - " + fullPath)
      });
      stream.pipe(fs.createWriteStream(fullPath, {mode: "0666"}));
    }
  };

  function updateStatus (socket) {
    return function (message) {
      var camera = Cameras.findBySocket(socket);
      camera.status = message.status;
      controllerIo.emit('status', {id: camera.id, status: camera.status})
    }
  };

  function registerCamera (socket) {
    return function (camera) {
      var existingCamera = Cameras.findById(camera.id);
      if (existingCamera) {
        existingCamera.socket = socket;
      }
      else {
        Cameras.add({name: camera.name, id: camera.id, socket: socket});
      }
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