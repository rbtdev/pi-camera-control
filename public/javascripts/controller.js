var controller = io.connect('/controller');
var cameraList = {};

function listCameras(cameras) {
    $('#camera-list').remove();
    var $cameraList = $("<div>", {id: "camera-list"});
    $('#cameras').append($cameraList);

    for (cameraId in cameras) {
        var $cameraRow = createCameraRow(cameraId);
        $cameraList.append($cameraRow)  
        updateCameraRow(cameraId);       
    }

}

function createCameraRow(cameraId) {
    var $cameraRow = $("<div>", {id:"camera-" + cameraId, class: "row"});
    var $statusRow = $('<div>', {class: 'row'});
    var $cameraName = $("<div>", {class: "col-xs-8 name"});
    var $buttonCol = $("<div>", {class: "col-xs-4 col-sm-2 col-md-1 col-lg-1"});
    var $alarmsRow = $('<div>', {class: 'row'});
    var $alarms = $('<div>', {class: 'col-xs-12 alarms'});
    var $cameraButton = $("<button>", {type: "button", class: "status"})
    $cameraButton.click(toggleStatus);
    $buttonCol.append($cameraButton);
    $alarmsRow.append($alarms);
    $statusRow.append($cameraName);
    $statusRow.append($buttonCol);
    $cameraRow.append($statusRow);
    $cameraRow.append($alarmsRow);

    return $cameraRow;
};

function updateCameraRow(cameraId) {
    var camera = cameraList[cameraId];
    var buttonStatus = {
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

    var btnStatus = buttonStatus[camera.status].class;
    var btnClass = "btn btn-block " + btnStatus + " status";
    var btnText = buttonStatus[camera.status].text;
    var id = '#camera-' + camera.id;
    var $cameraRow = $(id);
    $cameraRow.find('.name').text(camera.name);
    var $statusBtn = $cameraRow.find('.status');
    $statusBtn.text(btnText);
    $statusBtn.attr('data-camera-id', camera.id);
    $statusBtn.attr('class', btnClass);
}

function toggleStatus() {
    var cameraId = this.dataset.cameraId;
    var event = (cameraList[cameraId].status=='active')?'deactivate':'activate';
    controller.emit(event, {id: cameraId});
    return false
};

function setThumbnail(cameraId, alarmId, src) {
    var id = "#alarm-" + cameraId + "-" + alarmId;
    $(id).find(".alarm-image").error(function (e) {
        console.log('image error');
    }).attr("src",src)
}

function setAlarm(cameraId, alarm) {
    var id = "#camera-"+cameraId;
    var $alarms = $(id).find('.alarms');
    var $alarmItem = $('<div>', {id: "alarm-" + cameraId + "-" + alarm.timestamp, class: 'row alarm'});
    var $alarmText = $('<div>', {class: 'col-xs-8 timestamp',  text: alarm.type + " at " + alarm.timestamp})
    var $alarmImgCol = $('<div>', {class: 'col-xs-4'});
    var $alarmImgLink = $('<a>', {class: 'mjpeg-link', href: alarm.src});
    var $alarmImg = $("<img>", {class: "alarm-image thumbnail"});
    $alarmImgLink.append($alarmImg);
    $alarmItem.append($alarmText);
    $alarmItem.append($alarmImgCol);
    $alarmImgCol.append($alarmImgLink);
    $alarms.prepend($alarmItem);
}

function setMjpeg (cameraId, alarmId, src) {
    var id = 'alarm-' + cameraId + "-" + alarmId;
    $(id).find(".mjpeg-link").attr("src",src)
}

function setStatus(cameraId, status) {
    cameraList[cameraId].status = status;
    updateCameraRow(cameraId);
}

/**
 * Handle socket events
 */
controller
    .on('connect', function(socket) {
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