/*var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    tabs.open("http://www.mozilla.org/");
  }
});*/


var dnssaver = require("./overlay.js");

exports.main = function (options, callbacks) {
  require("sdk/tabs").on("ready", function(tab){
  //console.log("dnssaver url: "+tab.url);
  dnssaver.saveDNS(tab.url);
});
};


exports.onUnload = function (reason) {
	//console.log("onload reason:"+reason);
  if(reason=="disable" || reason=="uninstall"){
    dnssaver.deleteDB();
  }
};
