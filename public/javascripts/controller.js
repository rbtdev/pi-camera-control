var control = io.connect('/controller');

function listCameras(cameras) {
    var $cameraList = $("<div>", {id: "camera-list"});
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
    for (cameraId in cameras) {
        var camera = cameras[cameraId];
        var $cameraRow = $("<div>", {class: "row"});
        var $cameraName = $("<div>", {text: camera.name, class: "col-xs-3 name"});
        var $buttonCol = $("<div>", {class: "col-xs-3 col-sm-2 col-md-1 col-lg-1"});
        var btnStatus = buttonStatus[camera.status].class;
        var btnClass = "btn btn-block " + btnStatus;
        var btnText = buttonStatus[camera.status].text;
        var $imgCol = $("<div>", {class: "col-xs-4 image"});
        var $img = $("<img>", {id: "camera-img-" + camera.id})
        var $cameraButton = $("<button>", {type: "button", class: btnClass, text: btnText, 'data-camera-id': camera.id})
        $cameraButton.click(toggleStatus);
        $imgCol.append($img);
        $buttonCol.append($cameraButton);
        $cameraRow.append($cameraName);
        $cameraRow.append($buttonCol);
        $cameraRow.append($imgCol);
        $cameraList.append($cameraRow)          
    }
    $('#camera-list').remove();
    $('#cameras').append($cameraList);
}

function toggleStatus(evt) {
    var cameraId = this.dataset.cameraId;
    var event = (cameraList[cameraId].status=='active')?'deactivate':'activate';
    control.emit(event, {id: cameraId});
    return false
}

function setThumbnail(cameraId, src) {
    var id = "#camera-img-" + cameraId;
    $(id).attr("src",src);
};

function setAlarm(cameraId, type) {
    var id = "#camera-alarm-" + cameraId;
    $(id).text('Alarm triggered');
}
control
    .on('connect', function(socket) {
        console.log("Controller connected");
    })
    .on('status', function (status) {
        console.log("Got status for " + status.id + " - " + status.status)
        cameraList[status.id].status = status.status;
        listCameras(cameraList);
    })
    .on('alarm', function (alarm) {
        console.log("Got alarm signal for camera " + alarm.id + " - " + alarm.type);
        //setAlarm(alarm.id, alarm.type);
    })
    .on('image', function (image) {
        console.log("Got image from camera " + image.id);
        // set thumbnail to image
        setThumbnail(image.id, image.src);
    })
    .on('list', function (cameras) {
        cameraList = cameras;
        listCameras(cameras);
    })