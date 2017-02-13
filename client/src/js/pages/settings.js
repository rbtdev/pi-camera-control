var $ = require('jquery');

module.exports = function settings() {
    $.get('/settings')
        .done(function (response) {
            var settings = response.data;
            renderPage(settings);
        })

    function renderPage(settings) {
        console.log(JSON.stringify(settings, null, 2));
        var html = "<div id = 'settings-data'><pre>" + JSON.stringify(settings, null, 2) + "</pre></div>"
        $('#settings-data').remove();
        $('#settings').append(html);
    }
}