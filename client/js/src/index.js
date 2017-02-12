require('./bootstrap_hack');
var $ = require('jquery');
var pages = require('./pages');
var cameras = require('./pages/cameras');


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
        if (page.controller) page.controller();
    }
}

$(document).ready(function () {

    addPageLinks(pages)
    setPage(pages[0])();
    cameras.listen();

})