var $ = require('jquery');
var template = require('../templates').pages.profile;

module.exports = function profile() {
    $.get('/profile')
        .done(function (response) {
            renderPage(response.data);
        });

    function renderPage(profile) {
        var html = template({
            profile: profile
        })
        $('#profile-data').remove();
        $('#profile').append(html);
    }
}