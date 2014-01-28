const {Cc,Ci} = require("chrome");


var localmanager = require("./localmanager.js");

//com.xuanwu.dnssaver = function(){
	var pub={};
    //pub.localmanager= com.xuanwu.localmanager;
    
    //pub.localmanager.init();
    // If we notice an X-DNS-Prefetch-Control header for a URI, we store it here
    pub.dp_httpMetas=new Array();
    
    // XPCOM services
    pub.dp_dnsService= Cc["@mozilla.org/network/dns-service;1"].getService(Ci.nsIDNSService);
    pub.dp_ioService= Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    
    // Threading object
    pub.dp_thread= null;
    
    // Initialize the thread - try the Firefox 3 way first, and fall back to FF2 if need be
    pub.init_dp_thread= function() {
    	alert("init dp thread");
        try { pub.dp_thread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread; } catch (ex) { }
        if (!pub.dp_thread) { pub.dp_thread = Cc["@mozilla.org/event-queue-service;1"].getService(Ci.nsIEventQueueService).getSpecialEventQueue(Ci.nsIEventQueueService.UI_THREAD_EVENT_QUEUE); }
    };
    
    // Grab the pref branch
    pub.dp_prefBranch= null;
    
    // Store values from preferences
    pub.dp_disabledByPref= false;
    
    pub.currentHost = null;
    pub.currentDNS = null;
    
    // Async Callback
    pub.dp_listener= {
        onLookupComplete: function _onLookupComplete(request, record, status) {
            // No action, we were just doing the lookups to add them to the cache
            //alert("after lookup: ");
            pub.currentDNS = record.getNextAddrAsString();
            //alert(pub.currentDNS);
            
            localmanager.addRecord(pub.currentHost,pub.currentDNS,(new Date().getTime()));
            /*var records = localmanager.queryAll();
            var last = records[records.length-1];*/
            //console.log((records.length-1)+" "+last.host+": "+last.dns+" on "+(new Date(last.savedate)));
        }
    };
    
    // Grab the host out of a URI
    pub.dp_getHost= function(aURI) {
        try {
            return aURI.host;
        } catch (ex) {
            return null;
        }
    };

    // Construct a new URI from pieces
    pub.dp_makeURI= function(aURL, baseURI) {
        try {
            return pub.dp_ioService.newURI(aURL, null, baseURI);
        } catch (ex) {
            return null;
        }
    };
    
    // Resolve one hostname
    pub.dp_dnssaver= function(hostName) {
        try {
            pub.dp_dnsService.asyncResolve(hostName, 0, pub.dp_listener, pub.dp_thread);
        } catch (ex) {
            // Bury the exception
        }
    };
    
    // Driver
    pub.saveDNS= function(url) {
			//console.log("in saveDNS: "+url);
    //pub.saveDNS= function(aEvent) {
        /*if (true){//(!com.xuanwu.dnssaver.dp_disabledByPref) {
            var doc = aEvent.originalTarget;
            if (doc.nodeName && doc.nodeName != "#document") // Make sure we got a document
                return;
            if (doc instanceof HTMLDocument) {
                var win = doc.defaultView;
                if (win.frameElement) {
                  // Frame within a tab was loaded. win should be the top window of
                  // the frameset. If you don't want do anything when frames/iframes
                  // are loaded in this web page, uncomment the following line:
                  // return;
                  // Find the root document:
                  //win = win.top;
                return;
                }
              }else{
              	
                //alert("not document");
                return;
              }
              */
            var baseURI = pub.dp_makeURI(url, null);
            var baseHost = pub.dp_getHost(baseURI);
            //alert(doc.location.href.toLowerCase()+" host:"+baseHost);
            
            // Don't examine <a> tags for hosts to prefetch when the page uses certain non-web URI schemes
            if (baseURI.schemeIs('about') || baseURI.schemeIs('chrome') || baseURI.schemeIs('data') || baseURI.schemeIs('javascript')) {
                return;
            }
            
            var hrefs = new Array();
           
            // Convert hrefs to hosts and prefetch (if we haven't already)
            var uniqueHosts = new Array();
           
            
            // saver: only save the current href
            //alert(baseURI);
            uniqueHosts.push(baseHost);
            //alert(baseHost);
            pub.currentHost = baseHost;
            uniqueHosts.forEach(pub.dp_dnssaver);
        //}
    };
		pub.deleteDB = function(){
			//console.log("to remove sqlite file");
			localmanager.destroy();
		};
		
		exports.saveDNS = pub.saveDNS;
		exports.deleteDB = pub.deleteDB;
		
		
    /*return pub;
}();*/

