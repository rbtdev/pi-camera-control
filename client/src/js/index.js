require('./bootstrap_hack'); // Needed to let bootstrap.js see jquery
var $ = require('jquery');
var pages = require('./pages');
var cameras = require('./pages/cameras');
var templates = require('./templates');


function addPageLinks(pages) {
    $('#navbar').append(templates.navbar({
        pages: pages
    }));
    pages.forEach(function (page) {
        $('#' + page.id + '-nav-link').on('click', setPage(page));
        addPage(page.id);
    })

    function addPage(id) {
        var html = "<div id='" + id + "-page' class='container-fluid page'>" +
            "<div class='row'>" +
            "<div id='" + id + "' class='col-xs-12'></div>" +
            "</div>" +
            "</div>";
        $('#pages').append(html);
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
        if (page.controller) page.controller();
    }
}

$(document).ready(function () {

    addPageLinks(pages)
    setPage(pages[0])();
    cameras.listen();

})