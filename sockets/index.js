
var socketIo = require('socket.io');
var ioStream = require('socket.io-stream');
var Cameras = require('./cameras.js');
var path = require('path');
var moment = require('moment');
var dropbox = require('node-dropbox').api(process.env.DROPBOX_ACCESS_TOKEN);

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
    socket.on('mjpeg', sendMjpeg(socket));
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

  function sendMjpeg(socket) {
    return function (timestamp) {
      var camera = Cameras.findBySocket(socket);
      var url = "/mjpeg/" + timestamp;
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

  function dropboxUpload(filePath, cb) {
    console.log("Upload to dropbox stub");
    fs.readFile(filePath, function (err, contents) {
      if (err) console.log("Dropbox upload error - " + err);
      dropbox.createFile(path, contents, function (error, response, body) {
        if (err) console.log("db error " + error);
        console.log("Dropbox upload completed for " + filePath)
      });
    });
  }

  function sendImage (socket) {
    return function(stream, data, cb) {
      console.log("Got image upload event. Saving image.");
      var filename = "thumb_" + path.basename(data.name);
      var localDir =  publicDir + "/" + imageDir + "/capture/" + data.timestamp + "/";
      var url = "/" + imageDir + "/capture/" + data.timestamp + "/" + filename;
      var fullPath =  publicDir + url;
      try {
        fs.mkdirSync(localDir);
        fs.mkdirSync(localDir + "/mjpeg");
      } catch (e) {
        return console.log("Error creating directories.");
      }
      dropbox.createDir(data.timestamp, function (err, path) {
        if (err) return console.log("Error creating dropbox alarm dir");
        console.log("Dropbox Created " + path)
        dropbox.createDir(data.timestamp + "/mjpeg", function () {
          if (err) return console.log("Error creating dropbox mjpeg dir")
          stream.on('finish', function () {
            dropboxUpload(fullPath, function (err, resp, body) {
                console.log("DB Resp =" + resp);
                console.log("DB Body =" + body);
                var url = '';
                controllerIo.emit('thumbnail', {id: camera.id, alarmId: data.timestamp, src: url});
            })
          });
          stream.on('error', function () {
            return console.log("Steam error - " + fullPath)
          });
          console.log("Creating frame write stream.");
          stream.pipe(fs.createWriteStream(fullPath, {mode: "0666"}));
        });
      });

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