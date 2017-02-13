//
// Needed to get bootstrap.js to see JQuery
// http://stackoverflow.com/a/36699385
//

var jQuery = require('jquery');
window.$ = window.jQuery = jQuery;

require('bootstrap');

jQuery.noConflict(true);