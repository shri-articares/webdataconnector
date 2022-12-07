// Example of Standard Connections in Web Data Connectors using JSONPlaceholder JSON endpoints
// Tableau 10.1 - WDC API v2.1

// Define our Web Data Connector
(function(){
  var myConnector = tableau.makeConnector();
  myConnector.getSchema = function(schemaCallback) {
    // Create a promise to get our table schema info as well, just like above
    var tables = new Promise(function(resolve, reject) {
      loadJSON("TestConnectionsTableInfoData", function(json) {
        var obj = JSON.parse(json);
        var tableList = [];
        for (var table in obj.tables) {
          tableList.push(obj.tables[table]);
        }
        resolve(tableList);
      }, true);
    });
    // Once all our promises are resolved, we can call the schemaCallback to send this info to Tableau
    Promise.all([tables]).then(function(data) {
      schemaCallback(data[0]);
    });
  }

  myConnector.getData = function(table, doneCallback) {
    // Load our data from the API. Multiple tables for WDC work by calling getData multiple times with a different id
    // so we want to make sure we are getting the correct table data per getData call
    loadJSON(table.tableInfo.id, function(data) {
      var obj = JSON.parse(data);
      var tableData = [];
      // Iterate through the data and build our table
      for (var i = 0; i < obj.length; i++) {
        tableEntry = {};
        var ref = obj[i];
        // We can use this handy shortcut because our JSON column names match our schema's column names perfectly
        Object.getOwnPropertyNames(ref).forEach(function(val, idx, array){
          // Handle specific cases by checking the name of the property          
            tableEntry[val] = ref[val];          
        });
        tableData.push(tableEntry);
      }
      // Once we have all the data parsed, we send it to the Tableau table object
      table.appendRows(tableData);
      doneCallback();
    });
  }
  tableau.registerConnector(myConnector);
})();


// Helper function that loads a json and a callback to call once that file is loaded

function loadJSON(path, cb, isLocal) {
  var obj = new XMLHttpRequest();
  obj.overrideMimeType("application/json");
  if(isLocal) {
    obj.open("GET", "../json/" + path + ".json", true);
  }
  else {
	  console.log(path);
    obj.open("GET", "http://prototype.articaresplatform.com/api/Analytics/" + path, true);
  }
  obj.onreadystatechange = function() {
    if (obj.readyState == 4 && obj.status == "200"){
      cb(obj.responseText);
    }
  }
  obj.send(null);
}

function send() {
  tableau.submit();
}
