var Handlebars = require("handlebars");
 exports["navbar"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "                <li><a id='"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "-nav-link' class='nav-link' href=\"#\"><span class='glyphicon glyphicon-"
    + alias3(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"icon","hash":{},"data":data}) : helper)))
    + "'></span> "
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</a></li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<nav class=\"navbar navbar-inverse\">\n    <div class=\"container-fluid\">\n        <div class=\"navbar-header\">\n            <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\"#myNavbar\">\n                    <span class=\"icon-bar\"></span>\n                    <span class=\"icon-bar\"></span>\n                    <span class=\"icon-bar\"></span>                        \n                </button>\n            <span id=\"page-title\" class=\"navbar-brand\"></span>\n        </div>\n        <div class=\"collapse navbar-collapse\" id=\"myNavbar\">\n            <ul class=\"nav navbar-nav navbar-right\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.pages : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </ul>\n        </div>\n    </div>\n</nav>";
},"useData":true});
exports["pages"] = exports["pages"] || {};
exports["pages"]["cameras"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "    <div id=\"camera-"
    + alias2(alias1((depth0 != null ? depth0.id : depth0), depth0))
    + "\" class=\"row\">\n        <div class=\"row\">\n            <div class=\"col-xs-8 name\">My Pi</div>\n            <div class=\"col-xs-12 col-sm-6 col-md-2 col-lg-2\">\n                <a href=\"#\" class=\"btn btn-default btn-lg btn-danger status\" data-camera-id=\""
    + alias2(alias1((depth0 != null ? depth0.id : depth0), depth0))
    + "\"><span class = 'glyphicon glyphicon-off'></span></a>\n                <a href=\"#\" class=\"btn btn-default btn-lg capture\" data-camera-id=\""
    + alias2(alias1((depth0 != null ? depth0.id : depth0), depth0))
    + "\"><span class=\"glyphicon glyphicon-facetime-video\"></span></a>\n            </div>\n        </div>\n        <div class=\"row\"><input id=\""
    + alias2(alias1((depth0 != null ? depth0.id : depth0), depth0))
    + "-speak-text\" type=\"text\"><button type=\"button\" class='speak' data-camera-id=\""
    + alias2(alias1((depth0 != null ? depth0.id : depth0), depth0))
    + "\">Speak</button></div>\n        <div class=\"row\">\n            <div class=\"col-xs-12 alarms\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.alarms : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </div>\n        </div>\n    </div>\n";
},"2":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "                <div id=\"alarm-"
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"row alarm\">\n                    <div class=\"col-xs-8 timestamp\">"
    + alias3(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "</div>\n                    <div class=\"col-xs-4\">\n                        <a class=\"mjpeg-link\"><img class=\"alarm-image thumbnail\" src=\""
    + alias3(((helper = (helper = helpers.thumbUrl || (depth0 != null ? depth0.thumbUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"thumbUrl","hash":{},"data":data}) : helper)))
    + "\"></a>\n                    </div>\n                </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div id=\"camera-list\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.cameras : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</div>";
},"useData":true});
exports["pages"]["profile"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div id='profile-data' class='col-xs-12'>\n    <div class='col-xs-6'>\n        <div class='row' id='profile-username'>\n            <div class='col-xs-2'>Username</div>\n            <div class='col-xs-2 '><textarea>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.profile : depth0)) != null ? stack1.user : stack1)) != null ? stack1.name : stack1), depth0))
    + "</textarea></div>\n        </div>\n        <div class='row' id='profile-email'>\n            <div class='col-xs-2'>Email</div>\n            <div class='col-xs-2'><textarea>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.profile : depth0)) != null ? stack1.user : stack1)) != null ? stack1.email : stack1), depth0))
    + "</textarea></div>\n        </div>\n    </div>\n    <div class='col-xs-6 '>\n        <img src='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.profile : depth0)) != null ? stack1.user : stack1)) != null ? stack1.avatar : stack1), depth0))
    + "' class='img-thumbnail'>\n    </div>\n</div>";
},"useData":true});
exports["pages"]["settings"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "";
},"useData":true});