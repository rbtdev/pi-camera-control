var controller
var cameraList = {};

function listCameras(cameras) {
    $('#camera-list').remove();
    $('#cameras').append("<div id = 'camera-list'></div>");

    for (cameraId in cameras) {
        var $cameraRow = cameraRow(cameraId);
        $('#camera-list').append($cameraRow)
        updateCameraRow(cameraId);
    }

}

function cameraRow(cameraId) {
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
        class: "col-xs-12 col-sm-6 col-md-2 col-lg-2"
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
        '<a href="#" class="btn btn-default btn-lg status">' +
        '<span class="glyphicon glyphicon-off"></span>' +
        '</a>')
    $cameraButton.attr('data-camera-id', cameraId);

    var $captureButton = $(
        '<a href="#" class="btn btn-default btn-lg capture">' +
        '<span class="glyphicon glyphicon-facetime-video"></span>' +
        '</a>')
    $captureButton.attr('data-camera-id', cameraId);

    $cameraButton.click(toggleStatus);
    $captureButton.click(sendCapture);
    $speakButton.click(sendSpeach);
    $buttonCol.append($cameraButton);
    $buttonCol.append($captureButton);
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

function sendCapture() {
    var cameraId = this.dataset.cameraId;
    console.log("Sending capture event for cameraId: " + cameraId)
    controller.emit('capture', {
        id: cameraId
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
    console.log("Setting img src: id = " + id + " src = " + src)
    $(id).find(".alarm-image").error(function (e) {
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
            text: 'ON'
        },

        'disabled': {
            class: 'btn-danger',
            text: "OFF"
        }
    }
    var btnStatus = buttonClasses[status].class;
    var btnClass = "btn btn-default btn-lg " + btnStatus + " status";
    var btnText = buttonClasses[status].text;
    var $statusBtn = $(id).find('.status');
    //$statusBtn("<a>").text(btnText);
    $statusBtn.attr('class', btnClass);
}

function addPageLinks(pages) {
    var navList = $('#myNavbar').find("ul");
    pages.forEach(function (page) {
        var linkHtml = '<li><a id="' + page.title + '-nav" class = "nav-link" href="#">' +
            '<span class="glyphicon glyphicon-' + page.icon + '"></span> ' + page.title + '</a>'
        var link = $(linkHtml);
        if (page.id) addPageHtml(page.id);
        link.on('click', setPage(page));
        navList.append(link);
    })

    function addPageHtml(id) {
        var html = "<div id='" + id + "-page' class='container-fluid page'>" +
            "<div class='row'>" +
            "<div id='" + id + "' class='col-xs-12'></div>" +
            "</div>" +
            "</div>";
        $('#app').append(html);
    }
}

function setTitle(page) {
    $("#page-title").text(page.title);
}

function setPage(page) {
    return function () {
        if (page.id) {
            $(".page").toggle(false);
            $("#" + page.id + "-page").toggle(true);
            setTitle(page);
        }
        page.controller();
    }
}

//
// Controllers
//

function logout() {
    window.location = '/logout'
}

function settings() {
    $.get('/settings', function (data) {
        renderPage(data);
    });

    function renderPage(data) {
        console.log(JSON.stringify(data, null, 2));
        var html = "<div id = 'settings-data'><pre>" + JSON.stringify(data, null, 2) + "</pre></div>"
        $('#settings-data').remove();
        $('#settings').append(html);
    }
}

function profile() {
    $.get('/profile', function (response) {
        renderPage(response.data);
    });

    function renderPage(profile) {
        console.log(JSON.stringify(profile, null, 2));
        var html = "<div id = 'profile-data'>" +
            "<div id = 'profile-username'>" + profile.user.name + "</div>" +
            "<div id = 'profile-email'>" + profile.user.email + "</div>" +
            "<img src = '" + profile.user.avatar + "' class='img-thumbnail'>" +
            "</div>" +
            "</div>";
        $('#profile-data').remove();
        $('#profile').append(html);
    }
}

function cameras() {

}

var pages = [{
        title: "cameras",
        icon: "facetime-video",
        id: "cameras",
        controller: cameras
    },
    {
        title: "settings",
        icon: "cog",
        id: "settings",
        controller: settings
    },
    {
        title: "profile",
        icon: "user",
        id: "profile",
        controller: profile
    },
    {
        title: "logout",
        icon: "log-out",
        controller: logout
    }
]

$(document).ready(function () {

    addPageLinks(pages)
    setPage(pages[0])();

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