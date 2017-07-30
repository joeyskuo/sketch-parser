var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var drawdata = [];
createJSON(finish);

function createJSON(callback) {
	fs.readdir('raw', function(err, files) {
	    if (err) return;
	    console.log(files.length);

	    var filecount = 0;
	    files.forEach(function(f) {
	        var instream = fs.createReadStream("raw\\" + f);
			var outstream = new stream;
			var rl = readline.createInterface(instream, outstream);

			console.log("reading file " + f);
			var i = 0;
			

			rl.on('line', function(line) {
			  // process line here
			  //console.log("pushing line " + line);
			  if (i < 9) {
			  drawdata.push(line);
			  i++;
				} else {
					rl.close();
				}
			});

			rl.on('close', function() {
			  // do something on finish here
			  console.log("finished getting data for " + f);
			  filecount++;
			  console.log(filecount);
			  if (filecount == files.length) {callback(drawdata)};
			  //console.log("drawdata currently" + drawdata)
			});



	    });

	    

	});	
	
}


function finish(wdata, callback) {
	var fdata = [];
	for (var n = 0; n < wdata.length; n++) {
		fdata.push(JSON.parse(wdata[n]));
		delete fdata[n].countrycode;
		delete fdata[n].timestamp;
		delete fdata[n].key_id;
		fdata[n].time = 0;

		fdata[n].drawing = jFormat(fdata[n]);
		fdata[n].drawing = fdata[n].drawing.drawing;
		console.log("n = " + n);
		console.log(fdata[n]);
		if (n == wdata.length-1){
			var resultout = JSON.stringify(fdata);
			fs.writeFile("drawdata.json", resultout);
		}
	}
};


function jFormat(ddata) {
	var d = ddata.drawing;
	var drawing = [];

  	for (var k = 0, lenk = d.length; k < lenk; k++){  // for each stroke
    var stroke = [];
    var len = d[k][0].length;
    var drawtime = d[k][2][len-1]-d[k][2][0]; // end time - start time

    if (k < lenk-1){
      var delay = d[k+1][2][0]-d[k][2][len-1];  // start of next - end of previous
    } else {
      delay = 0;
    }

    for (var i = 0; i < len; i++){
      console.log("adding entry x: " + d[k][0][i] + "  y: " + d[k][1][i])
      stroke.push({x: d[k][0][i], y: d[k][1][i]})
      };

    drawing.push(stroke, drawtime, delay);  
  }  
  return {drawing};
}
// remove bad stuff, add time = 0