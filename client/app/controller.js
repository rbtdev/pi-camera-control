var controller = io.connect('/controller');
var cameras = require('./cameras.js');
var $ = require('jquery');
var cameraList = {};

/**
 * Handle socket events
 */
cameras.hello();
controller
    .on('connect', function (socket) {
        console.log("Controller connected");
    })
    .on('status', function (status) {
        console.log("Got status for " + status.id + " - " + status.status)
        cameras.setStatus(status.id, status.status);
    })
    .on('alarm', function (alarm) {
        console.log("Got alarm signal for camera " + alarm.id + " - " + alarm.type);
        cameras.setAlarm(alarm.id, alarm);
    })
    .on('thumbnail', function (image) {
        console.log("Got image from camera " + image.id);
        // set thumbnail to image
        cameras.setThumbnail(image.id, image.alarmId, image.src);
    })
    .on('list', function (list) {
        cameras.list(list);
    })
    .on('mjpeg', function (url) {
        cameras.setMjpeg(url.id, url.alarmId, url.src);
        console.log("Got MJPEG URL " + url);
    })