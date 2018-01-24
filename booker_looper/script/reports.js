//TZ=America/New_York PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs casperjs --verbose --log-level=warning --ssl-protocol=any --ignore-ssl-errors=true --web-security=no --path=/var/www/html/rumble-staging.rumble-boxing.com/booker_looper/ /var/www/html/rumble-staging.rumble-boxing.com/booker_looper/booker_looper.js

var fs = require('fs');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: 30000,
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
  path+"/moment.min.js",
  path+"/moment-timezone.min.js",
  path+"/moment-timezone-with-data.min.js"
];

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
var username = 'mike.ricotta';
var password = 'M1Rumbl3!KE';
var reOpenClass = true;

var adminer = 'https://rumble.zingfitstudio.com/';
var adminUrl = adminer;
var reportURL = adminer+'index.cfm?action=Report.';
var attendanceReportURL = reportURL+'attendanceExport&roomid=';		// This accepts 2 variables, the first is the roomid and the second is a period of time
var salesReportURL = reportURL+'allSalesByDate';					// This accepts 1 variables, the date range
var attendanceReports = {FlatironChelsea:'12900000001',Private:'12900000002',NoHo:'12900000003'};	// These are the 3 different types of reports that we'll loop through

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

// These are all the revenue reports that we'll loop through
var revenueReports = {
		//First time
		FirstTime : '12900000006',
		//1 Class
		OneClass : '12900000001',
		//5 Classes
		FiveClass : '12900000007',
		//Prelaunch 10
		PreLaunchTen : '12900000028',
		//10 classes
		TenClass : '12900000008',
		// 50 pack
		FiftyPack : '12900000005',
		//Tandem Training Add a Friend
		Tandem : '12900000017',
		//Private Training Session
		PrivateTraining : '12900000013',
		//PPX+1 - 1 Class
		Ppx1OneClass : '12900000021',
		//PPX+1 - 5 Classes
		Ppx1FiveClass : '12900000022',
		//Events - Bag Blocks
		Events : '12900000020',
	};

casper.start(adminUrl, function(){
  // this.echo("page loaded");
});

casper.waitForSelector('form.well', function() {
  this.fillSelectors('form.well', {
    'input[name="username"]' : username,
    'input[name="password"]' : password
  }, true);
});

casper.thenOpen('https://rumble.zingfitstudio.com/index.cfm?action=Booker.view', function(){
	// If we're prompted by the point of sale form, which occurs on redirect to URL https://rumble.zingfitstudio.com/index.cfm?action=Register.chooseSite, then we have to fill out the form... we're gonna try bypassing it entirely
	this.waitForUrl('https://rumble.zingfitstudio.com/index.cfm?action=Booker.view');
});

casper.thenOpen('https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard', function(){
	this.waitForUrl('https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard');
});

casper.then(function(){
	// This is all 3 of the class attendance reports
	Object.keys(attendanceReports).forEach(function(index){							//  For each of the attendance reports, execute for this current entire year.
		var identifier = attendanceReports[index];
		var reportpage = attendanceReportURL+identifier+'&start=1%2F1%2F'+currentYear+'&end=12%2F31%2F'+currentYear+'&export=csv';
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
		if((fileSizeInBytes > 500) && (substr == -1)){	// if filesize is greater than 500 and does not contain string
			if(fs.exists(logs+"attendance/attendance_"+index+"_"+currentYear+".csv")){
				fs.remove(logs+"attendance/attendance_"+index+"_"+currentYear+".csv");
			}
			fs.move(logs+"attendance/attendance_"+index+"_"+currentYear+".tmp.csv",logs+"attendance/attendance_"+index+"_"+currentYear+".csv");
		}
		// Only store today data if it is valid
		var fileSizeInBytes = fs.size(logs+"attendance/attendance_"+index+"_today.tmp.csv");
		var contents = fs.read(logs+"attendance/attendance_"+index+"_today.tmp.csv");
		var substr = contents.indexOf('System Error');
		if((fileSizeInBytes > 500) && (substr == -1)){	// if filesize is greater than 500 and does not contain string
			if(fs.exists(logs+"attendance/attendance_"+index+"_today.csv")){
				fs.remove(logs+"attendance/attendance_"+index+"_today.csv");
			}
			fs.move(logs+"attendance/attendance_"+index+"_today.tmp.csv",logs+"attendance/attendance_"+index+"_today.csv");
		}
	});
	
	this.then(function(){
		// REFACTOR: For January months, we'll have to deduct current Year by 1.
		var salesreport = salesReportURL+'&start='+lastMonth+'%2F1%2F'+currentYear+'&end='+lastMonth+'%2F'+eolm+'%2F'+currentYear;
		var reportpage = salesreport+'&go=GO';
		var reportexport = salesreport+'&export=csv';
		casper.thenOpen(reportpage, function(){
			casper.download(reportexport,logs+"sales/sales_"+lastMonth+"-"+currentYear+".csv");
		});
		// This is the sales report which runs one month at a time but runs for the whole month, which is fine.  We need to know exact end of month day (ie. 28th, 30th, 31st) or it won't run
		var salesreport2 = salesReportURL+'&start='+currentMonth+'%2F1%2F'+currentYear+'&end='+currentMonth+'%2F'+eom+'%2F'+currentYear;
		var reportpage2 = salesreport2+'&go=GO';
		var reportexport2 = salesreport2+'&export=csv';
		casper.thenOpen(reportpage2, function(){
			casper.download(reportexport2,logs+"sales/sales_"+currentMonth+"-"+currentYear+".csv");
		});
	});
});

casper.run();
