// save to local .sqlite, support management (query, delete, rename, etc.)
const {Cc,Ci} = require("chrome");

//com.xuanwu.localmanager = function(){
  var pub={};
  pub.LOCALRECORDFILE = "dnssaver.sqlite";
  pub.RECORDTABLENAME = "dns_records_0_1";

  // get profile directory
  pub.profilePath = Cc["@mozilla.org/file/directory_service;1"].
           getService(Ci.nsIProperties).
           get("ProfD", Ci.nsIFile);
	pub.profilePath.append(pub.LOCALRECORDFILE);
	
  pub.localRecord = function(){
    var file = pub.profilePath;/*= Cc["@mozilla.org/file/directory_service;1"]  
                      .getService(Ci.nsIProperties)  
                      .get("ProfD", Ci.nsIFile);  
    file.append(pub.LOCALRECORDFILE);  */
   
    var storageService = Cc["@mozilla.org/storage/service;1"]  
                         .getService(Ci.mozIStorageService);  
    return storageService.openDatabase(file);
  }();
  
  //for now no automatic merging. No checking for duplicate content (json). 
  pub.addRecord = function(host, dns, savedate){
    var q = "INSERT INTO " + pub.RECORDTABLENAME + "(host, dns, savedate) VALUES (:host, :dns, :savedate)";
    var statement = pub.localRecord.createStatement(q);
    statement.params.host = host;
    statement.params.dns = dns;
    statement.params.savedate = savedate;
    
    try {
      statement.executeStep();
      return 0;
    } 
    catch (e) {
      alert("DNS saver: Add record failed. Sorry don't know why yet.");
      statement.reset();
      return -1;
    }
  };
  
  //delete >1
  pub.deleteRecords = function(recordIds){
  	var pids="";
    var lastIdx=recordIds.length-1;
		for(var i=0;i<recordIds.length;i++){
			pids+= recordIds[i];
			if(i!=lastIdx){
				pids+=",";
			}
		}
    var str = "DELETE FROM " + pub.RECORDTABLENAME + " WHERE rowid IN ("+pids+")";
    
    var statement = pub.localRecord.createStatement(str);
    try {
      statement.executeStep();
    } 
    catch (e) {
      alert("DNS saver: delete record exception!");
      statement.reset();
    }
  };
		
  
  pub.queryAll = function(){
		//console.log("queryAll with file:"+pub.profilePath.path);
    var statement = pub.localRecord.createStatement("SELECT rowid,* from " + pub.RECORDTABLENAME);
    var items = [];
    try {
      while (statement.executeStep()) {
        var item = {};
        item.id = statement.getInt64(0);
        item.host = statement.getString(1);
        item.dns = statement.getString(2);
        item.savedate = statement.getInt64(3);
        items.push(item);
      }
      statement.reset();
      return items;  
    } 
    catch (e) {
      statement.reset();
			return items;
    }
  };
  
  pub.getDNSById = function(rowid){
    var statement = pub.localRecord.createStatement("SELECT dns from " + pub.RECORDTABLENAME + " where rowid=" + rowid);
    try {
      if (statement.executeStep()) {
        return statement.getString(0);
      }
      statement.reset();
      return items;  
    } 
    catch (e) {
      statement.reset();
    }
  };
  
  
  //built-in rowid, can't guarantee same order as savedate, if renaming is allowed
  pub.init = function(){
    //alert("local manager inited");
    //TODO: add pre-processing to check table from former version if format changes
    var statement = pub.localRecord.createStatement("CREATE TABLE IF NOT EXISTS " + pub.RECORDTABLENAME + "(host STRING, dns STRING, savedate INTEGER)");
    try {
      if (statement.executeStep()) {
        //alert("table opened");
      }
      statement.reset();
    } 
    catch (e) {
      alert(e);
      statement.reset();
    }
  };
  
  pub.destroy = function(){
		//console.log("to remove:"+pub.profilePath.path);
  	pub.profilePath.remove(false);
  };
  
  pub.init();
	
	
	exports.addRecord = pub.addRecord;
	exports.queryAll = pub.queryAll;
	exports.destroy = pub.destroy;
/*  return pub;
}();
*/
