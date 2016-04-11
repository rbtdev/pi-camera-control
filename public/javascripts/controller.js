var control = io.connect('/controller');

function listCameras(cameras) {
    var $cameraList = $("<div>", {id: "camera-list"});
    cameras.forEach(function (camera) {
        var $cameraRow = $("<div>", {class: "row"});
        var $cameraName = $("<div>", {text: camera.name, class: "col-xs-3 name"});
        var $buttonCol = $("<div>", {class: "col-xs-3 col-sm-2 col-md-1 col-lg-1"});
        var btnStatus = camera.active?"btn-success":"btn-danger";
        var btnClass = "btn btn-block " + btnStatus;
        var btnText = camera.active?"ON":"OFF";
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
    })
    $('#camera-list').remove();
    $('#cameras').append($cameraList);
}

function toggleStatus(evt) {
    var cameraId = this.dataset.cameraId;
    var event = cameraList[cameraId].active?'deactivate':'activate';
    control.emit(event, {id: cameraId});
    return false
}

function setThumbnail(cameraId, src) {
    var id = "#camera-img-" + cameraId;
    $(id).attr("src",src);
}
control
    .on('connect', function(socket) {
        console.log("Controller connected");
    })
    .on('status', function (status) {
        console.log("Got status for " + status.id + " - " + status.active)
        cameraList[parseInt(status.id)].active = status.active;
        listCameras(cameraList);
    })
    .on('alarm', function (alarm) {
        console.log("Got alarm signal for camera " + alarm.id + " - " + alarm.message);
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