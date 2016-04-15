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
  this.alarms.push(alarm);
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
    for (cameraId in _cameras) {
      var camera = _cameras[cameraId];
      list[cameraId] = camera.export();
    }
    return list;
  }
}

module.exports = Cameras;
