var $ = require('jquery');

module.exports = function profile() {
    $.get('/profile')
        .done(function (response) {
            renderPage(response.data);
        });

    function renderPage(profile) {
        console.log(JSON.stringify(profile, null, 2));
        var html =
            "<div id = 'profile-data class = 'col-xs-12'>" +
            "<div class = 'col-xs-6'>" +
            "<div class = 'row' id = 'profile-username'>" +
            "<div class = 'col-xs-2'>Username</div><div class = 'col-xs-2'><textarea>" + profile.user.name + "</textarea></div>" +
            "</div>" +
            "<div class = 'row' id = 'profile-email'>" +
            "<div class = 'col-xs-2'>Email</div><div class = 'col-xs-2'><textarea>" + profile.user.email + "</textarea></div>" +
            "</div>" +
            "</div>" +
            "<div class = 'col-xs-6'>" +
            "<img src = '" + profile.user.avatar + "' class='img-thumbnail'>" +
            "</div>" +
            "</div>";
        $('#profile-data').remove();
        $('#profile').append(html);
    }
}