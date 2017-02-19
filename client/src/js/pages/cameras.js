var moment = require('moment');
var $ = require('jquery');
var template = require('../templates').pages.cameras;

var controller;


module.exports.listen = function listen() {
    /**
     * Handle socket events
     */
    controller = io.connect('/controller')
    controller
        .on('connect', function (socket) {
            console.log("Controller connected");
        })
        .on('status', function (status) {
            console.log("Got status for " + status.id + " - " + status.status)
            setStatus(status.id, status.status);
        })
        .on('alarm', function (alarm) {
            console.log("Got alarm signal for camera " + alarm.camera_id + " - " + alarm.type);
            setAlarm(alarm.camera_id, alarm);
        })
        .on('thumbnail', function (image) {
            console.log("Got image from camera " + image.id);
            // set thumbnail to image
            setThumbnail(image.id, image.alarmId, image.src);
        })
        .on('list', function (cameras) {
            cameraList = cameras;
            listCameras(cameras);
        })
        .on('mjpeg', function (url) {
            setMjpeg(url.id, url.alarmId, url.src);
            console.log("Got MJPEG URL " + url);
        })
}

var cameraList = {};

function listCameras(cameras) {
    var html = template({
        cameras: cameras
    });
    $('#cameras-list').remove();
    $('#cameras').append(html);
    //attach click events
    $('#cameras').find('.status').on('click', toggleStatus);
    $('#cameras').find('.capture').on('click', sendCapture);
    $('#cameras').find('.speak').on('click', sendSpeach);
    cameras.forEach(function (camera) {
        setStatus(camera.id, camera.status);
    })
}


function updateCameraRow(cameraId) {
    var camera = cameraList[cameraId];
    var id = '#camera-' + camera.id;
    var $cameraRow = $(id);
    $cameraRow.find('.name').text(camera.name);
    setStatus(camera.id, camera.status);
    $(id).find('.alarms').empty();
    for (var i = camera.alarms.length - 1; i >= 0; i--) {
        setAlarm(camera.id, camera.alarms[i]);
    }
}

function toggleStatus() {
    var cameraId = this.dataset.cameraId;
    var event = (cameraList[cameraId].status == 'active') ? 'deactivate' : 'activate';
    controller.emit(event, {
        id: cameraId
    });
    return false
};

function sendSpeach() {
    var cameraId = this.dataset.cameraId;
    var textElement = $('#' + cameraId + "-speak-text");
    var text = textElement[0].value;
    console.log("Sending speech text: " + text)
    controller.emit('speak', {
        id: cameraId,
        text: text
    })
}

function sendCapture() {
    var cameraId = this.dataset.cameraId;
    console.log("Sending capture event for cameraId: " + cameraId)
    controller.emit('capture', {
        id: cameraId
    })
}

function setAlarm(alarm) {
    var cameraId = alarm.camera_id;
    var id = "#camera-" + cameraId;
    var $alarms = $(id).find('.alarms');
    var $alarmItem = $('<div>', {
        id: "alarm-" + cameraId + "-" + alarm.timestamp,
        class: 'row alarm'
    });
    var $alarmText = $('<div>', {
        class: 'col-xs-8 timestamp',
        text: moment.utc(alarm.timestamp, "YYYYMMDDHHmmss").local().format('MMM Do YYYY HH:mm:ss')
    })
    var $alarmImgCol = $('<div>', {
        class: 'col-xs-4'
    });
    var $alarmImgLink = $('<a>', {
        class: 'mjpeg-link'
    });
    var $alarmImg = $("<img>", {
        class: "alarm-image thumbnail"
    });
    $alarmImgLink.append($alarmImg);
    $alarmItem.append($alarmText);
    $alarmItem.append($alarmImgCol);
    $alarmImgCol.append($alarmImgLink);
    $alarms.prepend($alarmItem);
    if (alarm.thumbUrl) {
        setThumbnail(cameraId, alarm.timestamp, alarm.thumbUrl);
    }
    if (alarm.mjpegUrl) {
        setMjpeg(cameraId, alarm.timestamp, alarm.mjpegUrl);
    }
}

function setThumbnail(cameraId, alarmId, src) {
    var id = "#alarm-" + cameraId + "-" + alarmId;
    console.log("Setting img src: id = " + id + " src = " + src)
    $(id).find(".alarm-image").on('error', function (e) {
        console.log('image error');
    }).attr("src", src)
}

function hoverSrc(cameraId, alarmId, url) {
    return function () {
        console.log("Setting src");
        setThumbnail(cameraId, alarmId, url);
    }
}

function setMjpeg(cameraId, alarmId, url) {
    var id = '#alarm-' + cameraId + "-" + alarmId;
    var link = $(id).find(".mjpeg-link");
    link.attr("href", url);
    link.attr("target", "_blank");
    var thumbSrc = $(id).find('.alarm-image').attr('src');
    // link.hover(hoverSrc(cameraId, alarmId, url), hoverSrc(cameraId, alarmId, thumbSrc));
}

function setStatus(cameraId, status) {
    var id = "#camera-" + cameraId;
    cameraList[cameraId].status = status;
    var buttonClasses = {
        'offline': {
            class: 'btn-warning',
            text: 'Off Line'
        },

        'active': {
            class: 'btn-success',
            text: 'ON',
        },

        'disabled': {
            class: 'btn-danger',
            text: "OFF",
        }
    }
    var btnStatus = buttonClasses[status].class;
    var btnClass = "btn btn-default btn-lg " + btnStatus + " status";
    var btnText = buttonClasses[status].text;
    debugger
    var $statusBtn = $(id).find('.status');
    $statusBtn.attr('class', btnClass);
}