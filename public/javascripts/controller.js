var controller
var cameraList = {};

function listCameras(cameras) {
    $('#camera-list').remove();
    var $cameraList = $("<div>", {
        id: "camera-list"
    });
    $('#cameras').append($cameraList);

    for (cameraId in cameras) {
        var $cameraRow = createCameraRow(cameraId);
        $cameraList.append($cameraRow)
        updateCameraRow(cameraId);
    }

}

function createCameraRow(cameraId) {
    var $cameraRow = $("<div>", {
        id: "camera-" + cameraId,
        class: "row"
    });
    var $statusRow = $('<div>', {
        class: 'row'
    });
    var $cameraName = $("<div>", {
        class: "col-xs-8 name"
    });
    var $buttonCol = $("<div>", {
        class: "col-xs-4 col-sm-2 col-md-1 col-lg-1"
    });
    var $speakRow = $("<div>", {
        class: 'row'
    })
    var $speakText = $("<input>", {
        id: cameraId + "-speak-text",
        type: "text"
    });
    var $speakButton = $("<button>", {
        type: "button",
        'data-camera-id': cameraId,
        text: "Speak"
    });
    var $alarmsRow = $('<div>', {
        class: 'row'
    });
    var $alarms = $('<div>', {
        class: 'col-xs-12 alarms'
    });
    var $cameraButton = $(
        '<button type="button" class="btn btn-default btn-sm">' +
        '<span class="glyphicon glyphicon-off"></span>' +
        '</button>')
    // var $cameraButton = $("<button>", {
    //     type: "button",
    //     class: "btn btn-default btn-sm",
    //     'data-camera-id': cameraId
    // })
    $cameraButton.click(toggleStatus);
    $speakButton.click(sendSpeach);
    $buttonCol.append($cameraButton);
    $speakRow.append($speakText);
    $speakRow.append($speakButton);
    $alarmsRow.append($alarms);
    $statusRow.append($cameraName);
    $statusRow.append($buttonCol);
    $cameraRow.append($statusRow);
    $cameraRow.append($speakRow);
    $cameraRow.append($alarmsRow);

    return $cameraRow;
};



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



function setAlarm(cameraId, alarm) {
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
    $(id).find(".alarm-image").error(function (e) {
        console.log('image error');
    }).attr("src", src)
}

function setMjpeg(cameraId, alarmId, url) {
    var id = '#alarm-' + cameraId + "-" + alarmId;
    var link = $(id).find(".mjpeg-link");
    link.attr("href", url);
    link.attr("target", "_blank");
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
            text: 'ON'
        },

        'disabled': {
            class: 'btn-danger',
            text: "OFF"
        }
    }
    var btnStatus = buttonClasses[status].class;
    var btnClass = "btn btn-default btn-sm " + btnStatus;
    var btnText = buttonClasses[status].text;
    var $statusBtn = $(id).find('.status');
    $statusBtn.text(btnText);
    $statusBtn.attr('class', btnClass);
}

function logout() {
    window.location = '/logout'
}

function settings() {

}
//
// When loaded, set up app events
//
$(document).ready(function () {
    $('#logout').on('click', logout);
    $('#settings').on('click', settings);

    /**
     * Handle socket events
     */
    controller = io.connect('/controller');
    controller
        .on('connect', function (socket) {
            console.log("Controller connected");
        })
        .on('status', function (status) {
            console.log("Got status for " + status.id + " - " + status.status)
            setStatus(status.id, status.status);
        })
        .on('alarm', function (alarm) {
            console.log("Got alarm signal for camera " + alarm.id + " - " + alarm.type);
            setAlarm(alarm.id, alarm);
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

})