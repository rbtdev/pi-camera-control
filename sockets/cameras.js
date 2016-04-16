var _cameras = {};


function Camera (camera) {
  this.name = camera.name;
  this.socket = camera.socket;
  this.status = 'disabled';
  this.id = camera.id;
  this.alarms = [];
};

Camera.prototype.export = function () {
  return {
      name: this.name, 
      id: this.id, 
      status: this.status, 
      alarms: this.alarms
    }
};

Camera.prototype.setStatus = function (status) {
  this.status = status;
};

Camera.prototype.addAlarm = function (alarm) {
  console.log("Creating alarm: " + JSON.stringify(alarm));
  alarm.mjpegs = [];
  this.alarms.unshift(alarm);
}

Camera.prototype.setThumbnailUrl = function (alarmId, url) {
  console.log("Setting thumbnail: alarmId = " + alarmId + " url = " + url);
  var alarm = this.findAlarmById(alarmId);
  if (alarm) {
    alarm.thumbUrl = url;
  }
}

Camera.prototype.addMjpegFrame = function (alarmId, url) {
  var alarm = this.findAlarmById(alarmId);
  if (alarm) {
    alarm.mjpegs.unshift(url);
  }
}

Camera.prototype.setMjpegUrl = function (alarmId, url) {
  var alarm = this.findAlarmById(alarmId);
  if (alarm) {
    alarm.mjpegUrl = url;
  }
}

Camera.prototype.findAlarmById = function (alarmId) {
  console.log("Finding alarm with timestamp = " + alarmId);
  console.log("Alarm list = " + JSON.stringify(this.alarms));
  console.log("Alarms Length = " + this.alarms.length);
  for (var i = 0; i<this.alarms.length; i++) {
    console.log("index = " + i);
    var alarm = this.alarms[i];
    console.log("Alarm = " + JSON.stringify(alarm))
    console.log("Timestamp = " + alarm.timestamp);
    if (this.alarms[i].timestamp === alarmId) {
      console.log("Found alarm");
      return this.alarms[i];
    }
  }
}


var Cameras = {

  add: function (camera) {
    var newCamera = new Camera({name: camera.name, id: camera.id, socket: camera.socket})
    _cameras[newCamera.id] = newCamera;
  },

  findById: function (id) {
    return _cameras[id];
  },

  findBySocket: function (socket) {
    for (var cameraId in _cameras) {
      if (_cameras[cameraId].socket === socket) {
        return (_cameras[cameraId]);
      }
    }
  },

  remove: function (camera) {
    if (_cameras[camera.id]) {
      delete _cameras[camera.id];
    }
    else {
      console.log("Cannot remove camera: " + camera)
    }
  },

  list: function () {
    var list = {};
    for (var cameraId in _cameras) {
      var camera = _cameras[cameraId];
      list[cameraId] = camera.export();
    }
    return list;
  }
}

module.exports = Cameras;
