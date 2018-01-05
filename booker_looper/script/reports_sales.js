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
 /* path+"/moment.min.js",
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

var url = 'https://www.rumble-boxing.com/';
var username = 'mricotta';
var password = 'Rumbl3123!';

var adminer = 'https://rumble.zingfitstudio.com/';
var adminUrl = url+'admin/';
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
	casper.thenOpen(bookerUrl, function(){
		// If we're prompted by the point of sale form, which occurs on redirect to URL https://rumble.zingfitstudio.com/index.cfm?action=Register.chooseSite, then we have to fill out the form... we're gonna try bypassing it entirely
		this.waitForUrl(bookerUrl);
	});

	casper.thenOpen('https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard', function(){
		this.waitForUrl('https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard');
	});
});

casper.then(function(){	
		// REFACTOR: For January months, we'll have to deduct current Year by 1.
		var salesreport = salesReportURL+'&start='+lastMonth+'%2F1%2F'+currentYear+'&end='+lastMonth+'%2F'+eolm+'%2F'+currentYear;
		var reportpage = salesreport+'&go=GO';
		var reportexport = salesreport+'&export=csv';
		if(currentDate <= 2){
			casper.thenOpen(reportpage, function(){
				casper.download(reportexport,logs+"sales/sales_"+lastMonth+"-"+currentYear+".csv");
			});
		}
		// This is the sales report which runs one month at a time but runs for the whole month, which is fine.  We need to know exact end of month day (ie. 28th, 30th, 31st) or it won't run
		var salesreport2 = salesReportURL+'&start='+currentMonth+'%2F1%2F'+currentYear+'&end='+currentMonth+'%2F'+eom+'%2F'+currentYear;
		var reportpage2 = salesreport2+'&go=GO';
		var reportexport2 = salesreport2+'&export=csv';
		casper.thenOpen(reportpage2, function(){
			casper.download(reportexport2,logs+"sales/sales_"+currentMonth+"-"+currentYear+".csv");
		});
});

casper.run(function(){
	casper.exit();
});
