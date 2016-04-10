var control = io.connect('/controller');

function listCameras(cameras) {
    var $cameraList = $("<div>", {id: "camera-list"});
    cameras.forEach(function (camera) {
        var $cameraRow = $("<div>", {class: "row"});
        var $cameraName = $("<div>", {text: camera.name, class: "col-xs-3"});
        var $buttonCol = $("<div>", {class: "col-xs-3 col-sm-2 col-md-1 col-lg-1"});
        var btnStatus = camera.active?"btn-success":"btn-danger";
        var btnClass = "btn btn-block " + btnStatus;
        var btnText = camera.active?"ON":"OFF";
        var $cameraButton = $("<button>", {type: "button", class: btnClass, text: btnText, 'data-camera-id': camera.id})
        $cameraButton.click(toggleStatus);
        $buttonCol.append($cameraButton);
        $cameraRow.append($cameraName);
        $cameraRow.append($buttonCol);
        $cameraList.append($cameraRow)          
    })
    $('#camera-list').remove();
    $('#cameras').append($cameraList);
}

function toggleStatus(evt) {
    var cameraId = this.dataset.cameraId;
    var event = cameraList[cameraId].active?'deactivate':'activate';
    control.emit(event, {id: cameraId});
    return false;
}


control.on('connect', function(socket) {
    console.log("Controller connected");
});
control.on('status', function (status) {
    console.log("Got status for " + status.id + " - " + status.active)
    cameraList[parseInt(status.id)].active = status.active;
    listCameras(cameraList);
})
control.on('list', function (cameras) {
    cameraList = cameras;
    listCameras(cameras);
});