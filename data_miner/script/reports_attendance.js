//TZ=America/New_York PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs casperjs --verbose --log-level=warning --ssl-protocol=any --ignore-ssl-errors=true --web-security=no --path=/var/www/html/rumble-staging.rumble-boxing.com/booker_looper/ /var/www/html/rumble-staging.rumble-boxing.com/booker_looper/booker_looper.js

var fs = require('fs');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: 45000,
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
  path = "/var/www/html2/rumble-scripts/booker_looper/script";
}
casper.options.clientScripts = [
  /*path+"/moment.min.js",
  path+"/moment-timezone.min.js",
  path+"/moment-timezone-with-data.min.js"*/
];

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
  // this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  // this.echo("Page Error: " + msg, "ERROR");
});

var url = 'https://rumble.zingfitstudio.com/';
var username = 'mike.ricotta';
var password = 'M1Rumbl3!KE';

var adminer = 'https://rumble.zingfitstudio.com/';
var adminUrl = adminer;
var reportURL = adminer+'index.cfm?action=Report.';
var attendanceReportURL = reportURL+'attendanceExport&roomid=';		// This accepts 2 variables, the first is the roomid and the second is a period of time
var salesReportURL = reportURL+'allSalesByDate';					// This accepts 1 variables, the date range
var attendanceReports = {FlatironChelsea:'12900000001',NoHo:'12900000003',UESPrivate:'12900000005', UESStudio2:'12900000006',UESStudio4:'12900000007',UESSaunas:'12900000004',WeHo:'12900000009',Private:'12900000002',WeHoPrivate:'12900000008'};	// These are the 5 different types of reports that we'll loop through
var roomsRegions = {'12900000001':'12900000002','12900000002':'12900000002','12900000005':'12900000002','12900000006':'12900000002','12900000007':'12900000002','12900000004':'12900000002','12900000003':'12900000002','12900000009':'12900000004','12900000008':'12900000004'};

var file = 'zingfit_report_download.log';
var logs = '/var/www/html2/rumble-scripts/zflogs/';
var currentDate = new Date().getDate().toString();					// Gets full date
var currentMonth = new Date().getMonth();
var lastMonth = new Date().getMonth().toString();					// For some reason, getMonth goes from 0, so this month is actually getMonth+1, last month is getMonth
var currentMonth = currentMonth + 1;
var currentMonth = currentMonth.toString();							// Gets numeric month
var currentYearFull = new Date().getFullYear().toString();			// Gets full year
var currentYear = currentYearFull.substr(-2);						// Gets 2 digit year
var eom = new Date(currentYearFull, currentMonth, 0).toString().substr(8,2);	// end of this month
var eolm = new Date(currentYearFull, lastMonth, 0).toString().substr(8,2);		// end of last month
var bookerUrl = 'https://rumble.zingfitstudio.com/index.cfm?action=Booker.view';

casper.start(adminUrl, function(){
  // this.echo("page loaded");
});

casper.waitForSelector('form.well', function() {
  this.fillSelectors('form.well', {
    'input[name="username"]' : username,
    'input[name="password"]' : password
  }, true);
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
	this.thenOpen('https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard', function(){
		this.waitForUrl('https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard');
	})
});

casper.then(function(){
	// This is all 3 of the class attendance reports
	Object.keys(attendanceReports).forEach(function(index){							//  For each of the attendance reports, execute for this current entire year.
		var identifier = attendanceReports[index];
		var regionselector = roomsRegions[identifier];
		var setRegion = adminer+'index.cfm?action=Register.setSite&siteid='+regionselector+'&returnurl=%2Findex%2Ecfm%3Faction%3DReport%2Edashboard';
		casper.thenOpen(setRegion, function(){
			this.waitForUrl('https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard');		
		});
		casper.thenOpen(attendanceReportURL+identifier+'&start=7%2F1%2F'+currentYear+'&end=12%2F31%2F'+currentYear, function(){
			
		});
		casper.then(function(){
			var reportpage = attendanceReportURL+identifier+'&start=7%2F1%2F'+currentYear+'&end=12%2F31%2F'+currentYear+'&export=csv';
			var reporttoday = attendanceReportURL+identifier+'&start='+currentMonth+'%2F'+currentDate+'%2F'+currentYear+'&end='+currentMonth+'%2F'+currentDate+'%2F'+currentYear+'&export=csv';
			//casper.download(reportpage,logs+"attendance/attendance_"+index+"_"+currentMonth+"-"+currentYear+".csv");
			// Get full year data
			casper.download(reportpage,logs+"attendance/attendance_"+index+"_"+currentYear+".tmp.csv");
			// Get "today" data
			casper.download(reporttoday,logs+"attendance/attendance_"+index+"_today.tmp.csv");
			// Only store full year data if it is valid
			var fileSizeInBytes = fs.size(logs+"attendance/attendance_"+index+"_"+currentYear+".tmp.csv");
			var contents = fs.read(logs+"attendance/attendance_"+index+"_"+currentYear+".tmp.csv");
			var substr = contents.indexOf('System Error');
			if((fileSizeInBytes > 200) && (substr == -1)){	// if filesize is greater than 500 and does not contain string
				if(fs.exists(logs+"attendance/attendance_"+index+"_"+currentYear+".csv")){
					fs.remove(logs+"attendance/attendance_"+index+"_"+currentYear+".csv");
				}
				fs.move(logs+"attendance/attendance_"+index+"_"+currentYear+".tmp.csv",logs+"attendance/attendance_"+index+"_"+currentYear+".csv");
			}
			// Only store today data if it is valid
			var fileSizeInBytes = fs.size(logs+"attendance/attendance_"+index+"_today.tmp.csv");
			var contents = fs.read(logs+"attendance/attendance_"+index+"_today.tmp.csv");
			var substr = contents.indexOf('System Error');
			if((fileSizeInBytes > 200) && (substr == -1)){	// if filesize is greater than 500 and does not contain string
				if(fs.exists(logs+"attendance/attendance_"+index+"_today.csv")){
					fs.remove(logs+"attendance/attendance_"+index+"_today.csv");
				}
				fs.move(logs+"attendance/attendance_"+index+"_today.tmp.csv",logs+"attendance/attendance_"+index+"_today.csv");
			}
		});
	});
});

casper.run(function(){
	casper.exit();
});
