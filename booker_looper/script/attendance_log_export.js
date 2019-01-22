//TZ=America/New_York PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs casperjs --verbose --log-level=warning --ssl-protocol=any --ignore-ssl-errors=true --web-security=no --path=/var/www/html/rumble-staging.rumble-boxing.com/booker_looper/ /var/www/html/rumble-staging.rumble-boxing.com/booker_looper/booker_looper.js

var fs = require('fs');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: '10000',
  // clientScripts: ,
  pageSettings: {
    loadImages:  false,         // The WebPage instance used by Casper will
    loadPlugins: false,         // use these settings
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
  }
});

// var path = fs.absolute('');
var path = casper.cli.get('path');
if (typeof path === 'undefined' ) {
  path = "/var/www/html/rumble-boxing.com/booker_looper";
  notespath = "/var/www/html2/rumble-scripts/zflogs/notes";
}
casper.options.clientScripts = [
  path+"/moment.min.js",
  path+"/moment-timezone.min.js",
  path+"/moment-timezone-with-data.min.js"
];
// casper.echo(path);

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
  // this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  // this.echo("Page Error: " + msg, "ERROR");
});

// var url = 'http://rmbl.zingfit.net/';
// var username = 'admin';
// var password = 'password';
// var reOpenClass = false;
var url = 'https://rumble.zingfitstudio.com/';
var username = 'mricotta';
var password = 'Rumbl3123!';
var reOpenClass = true;
var bookerUrl = 'https://rumble.zingfitstudio.com/index.cfm?action=Booker.view';
var adminer = 'https://rumble.zingfitstudio.com/';
var adminUrl = adminer;
var bookerPage = adminer+'index.cfm?action=Booker.view';
var attendanceLog = adminer+'index.cfm?action=Booker.attendanceLog&classid=';
var alertUrl = '';
var classes = {};
var classnote = waitlist = classButton = '';
var waitlistEmpty = dontopenStatus = classButtonClosed = bookableSpot = false;
var currentTime = '';
var mailerkey = 'AV5Zsslka';
var logs = '/var/www/html2/rumble-scripts/zflogs/';
//var rooms = {FlatironChelsea:'12900000001',NoHo:'12900000003'};	// These are the 3 different types of reports that we'll loop through
var rooms = {'12900000002':['12900000001','12900000003','12900000006','12900000007'],'12900000004':['12900000009']};	// These are the 3 different types of reports that we'll loop through

casper.start(adminUrl, function(){
  // this.echo("page loaded");
});

casper.waitForSelector('form.well', function() {
  this.fillSelectors('form.well', {
    'input[name="username"]' : username,
    'input[name="password"]' : password
  }, true);
	this.echo('form loaded');
});

casper.then(function(){
	var ur = this.getCurrentUrl();
	if(ur.indexOf('chooseSite')>=0){
				this.echo('url redirected');
				this.waitForSelector('form[name="siteform"]',function(){
					this.then(function(){
						this.click('input[value="12900000001"]');
					});
					this.then(function(){
						this.click('button[type="submit"]');
					});
				});
	}
});

casper.then(function(){
	casper.thenOpen(bookerUrl, function(){
		this.once('url.changed',function(url) {
			this.echo('url changed');
			var ur = this.getCurrentUrl();
			if(ur.indexOf('chooseSite')>=0){
				this.echo('url redirected');
				this.waitForSelector('form[name="siteform"]',function(){
					this.then(function(){
						this.click('input[value="12900000001"]');
					});
					this.then(function(){
						this.click('button[type="submit"]');
					});
				});
			}
		});
	});
	this.thenOpen(bookerUrl, function(){
		this.waitForUrl(bookerUrl);
	});
});

casper.then(function(){

	Object.keys(rooms).forEach(function(index){
		var rms = rooms[index];
		var setRegion = adminer+'index.cfm?action=Register.setSite&siteid='+index+'&returnurl=%2Findex%2Ecfm%3Faction%3DReport%2Edashboard';
		casper.thenOpen(setRegion, function(){
			this.waitForUrl(dashboard, function(){
				// Do nothing
			});		
		});
	
		  casper.each(rms, function(self, identifier){
			var bookerUrl = bookerPage+"&roomid="+identifier;
			//console.log(bookerUrl);
			if(identifier == '12900000001') { 
				var room = 'FlatironChelsea';
			} else if(identifier == '12900000003') { 
				var room = 'NoHo';
			} else if(identifier == '12900000009') { 
				var room = 'WeHo';
			} else if(identifier == '12900000006') { 
				var room = 'UESStudio2';
			} else if(identifier == '12900000007') { 
				var room = 'UESStudio4';
			}
			this.echo('room selected');
			//retrieve classes
			casper.thenOpen(bookerUrl, function(){
			  this.echo('booker url opened'); 
			  this.waitForUrl(bookerUrl, function(){
				this.echo(bookerUrl+' opened and loaded');
				//this.echo('url loaded');
				// this.echo("We're in");
				// Clicking on T after Classes so we can retrieve hour,min from url
				this.evaluate(function(){
				  loadClassList('T');
				});
				this.wait(4000,function(){
				  // this.echo('Wait for loadClassList to finish');
				});
			  });
			});

			casper.waitForSelector('#classlist ul#day0',function(){
			  classes = this.evaluate(function(){
				var cl = {};
				var id,currentClassDate,currentClassDateObj,linktext,isPrivate,enrolled;
				var now = moment().tz('America/New_York');
				var later = moment().add(168,'hours').tz('America/New_York');
				$.each($('#classlist ul#day0 a'),function(i,v){
				  currentClassDate = $(v).data('classdate');
				  currentClassDateObj = moment(currentClassDate);

				  linktext = $(v).text();
				  if(linktext.indexOf('Private')==-1){
					isPrivate = false;
				  } else {
					isPrivate = true;
				  }

				  enrolled =$(v).parent('li').find('.enrolled').text();
				  if(typeof enrolled == 'undefined'){
					this.reload(function(){
						this.echo('refreshed because no numbers');
					});
				  }

				  if (now < currentClassDateObj && currentClassDateObj < later && isPrivate===false){
					id = $(v).attr('id');
					var classtime = currentClassDateObj.toString().replace(/[:]/g, "-");
					cl[classtime] = id;
				  }
				});
				return cl;
			  });
			});

			casper.then(function(){
				var i = 0;
			  // loop through classes
			  var cl = Object.keys(classes).map(function (key) { return classes[key]; });
			  this.eachThen(cl, function(r){
				currentClassID = r.data.substr(5);
					  this.echo('each class');
				casper.thenOpen(attendanceLog+currentClassID, function(){
					this.echo('running open');
					var classtime = Object.keys(classes)[i];
					i++;
					this.echo('room: '+room);
					this.echo('class time is: '+classtime);
					var filename = logs+'attendance/attendance_'+room+'_'+classtime+'.csv';
					casper.waitForSelector('thead',function(){
						this.echo('thead found');
						// Sorts results by date... default is ascending
						this.click('thead th:nth-child(3)');
						casper.then(function(){
							var string = '';
							this.waitForSelector('table.table-bordered tbody', function() {
								this.echo('tbody found');
								var table = casper.evaluate(function() {
									return document.querySelector('table.table-bordered tbody');
								});
								this.wait(4000,function(){
									if (typeof table !== 'undefined') {
										var tr = this.evaluate(function() {
											return document.querySelectorAll('table.table-bordered tbody tr').length;
										});
										var i = 0;
										var j = 0;
										for (i = 0; i < tr; ++i) {
											var cell = casper.evaluate(function(cssSelector){
												var str = '';
												__utils__.findAll(cssSelector).forEach(function(el){
													str += '"'+el.textContent.trim()+'",';
												});
												return str;
											}, 'table.table-bordered tbody tr:nth-child('+i+') td');
											string += cell+'\r\n';
										};
										this.echo('writing to '+filename);
										fs.write(filename, string, 'a');
									} else {
										this.echo('table undefined');
									}
								});
							});
						});
					});
				});
			  });
			});
		  });
	});
});

casper.run(function(){
	casper.exit();
});
