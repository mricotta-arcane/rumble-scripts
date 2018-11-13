//TZ=America/New_York PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs casperjs --verbose --log-level=warning --ssl-protocol=any --ignore-ssl-errors=true --web-security=no --path=/var/www/html/rumble-staging.rumble-boxing.com/booker_looper/ /var/www/html/rumble-staging.rumble-boxing.com/booker_looper/booker_looper.js

var fs = require('fs');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: 20000,
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
  path = "/var/www/html/rumble-scripts/booker_looper/script";
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

// var url = 'http://rmbl.zingfit.net/';
// var username = 'admin';
// var password = 'password';
// var reOpenClass = false;
var username = 'mike.ricotta';
var password = 'M1Rumbl3!KE';
var reOpenClass = true;

var adminer = 'https://rumble.zingfitstudio.com/';
var adminUrl = adminer;
var reportURL = adminer+'index.cfm?action=Report.';

var file = 'zingfit_report_download.log';
var logs = '/var/www/html2/rumble-scripts/zflogs/';
var currentDate = new Date().getDate().toString();								// Gets full date
var currentMonth = new Date().getMonth();
var lastMonth = new Date().getMonth().toString();					// For some reason, getMonth goes from 0, so this month is actually getMonth+1, last month is getMonth
var currentMonth = currentMonth + 1;
var currentMonth = currentMonth.toString();							// Gets numeric month
var currentYearFull = new Date().getFullYear().toString();			// Gets full year
var currentYear = currentYearFull.substr(-2);						// Gets 2 digit year
var eom = new Date(currentYearFull, currentMonth, 0).toString().substr(8,2);	// end of this month
var eolm = new Date(currentYearFull, lastMonth, 0).toString().substr(8,2);		// end of last month
var regions = ['12900000002','12900000004','751454502594283131'];
var bookerUrl = 'https://rumble.zingfitstudio.com/index.cfm?action=Booker.view';
var months = ['1','2','3','4','5','6','7','8','9','10','11','12'];

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
	this.thenOpen(bookerUrl, function(){
		this.waitForUrl(bookerUrl);
	});
});

casper.then(function(){
	/*casper.each(regions, function(self, rgn){
		var setRegion = adminer+'index.cfm?action=Register.setSite&siteid='+rgn+'&returnurl=%2Findex%2Ecfm%3Faction%3DReport%2Edashboard';
		casper.thenOpen(setRegion, function(){
			this.waitForUrl('https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard');		
		});
		casper.then(function(){
			if(rgn == '12900000002') { 
				var loc = 'NY';
			} else if(rgn == '12900000004') { 
				var loc = 'LA';
			} else { 
				var loc = 'NY';
			}*/
			var index = 'FirstTime';
			var identifier = '12900000006';
			var filename = logs+'revenue/RevenueReport_'+index+'_'+identifier+'.csv';
			var string = '';
			var header_string = '';
			fs.write(filename, string, 'w');
			for(var i = 5, len = months.length; i < len; i++){
				var eotm = new Date(currentYearFull, months[i], 0).toString().substr(8,2);	// end of this month
				var revenueURL = reportURL+'earnedSeriesRevenueDetail&type=series&gatewayid=12900000001&seriesid='+identifier+'&start='+months[i]+'%2F1%2F'+currentYear+'&end='+months[i]+'%2F'+eotm+'%2F'+currentYear;
				casper.thenOpen(revenueURL, function(){
					if(header_string.length == 0){
						this.waitForSelector('table.table-bordered thead', function() {
							var headers = casper.evaluate(function() {
								return document.querySelector('table.table-bordered thead');
							});
							this.wait(4000,function(){
								if (typeof headers !== 'undefined') {
									var hdr = casper.evaluate(function(cssSelector){
										var st = '';
										__utils__.findAll(cssSelector).forEach(function(el){
											st += '"'+el.textContent.trim()+'",';
											console.log('header: '+st);
										});
										return st;
									}, 'table.table-bordered thead tr:nth-child(2) th');
									header_string = hdr+'\r\n';
								} else {
									console.log('table undefined');
								}
							});
						});
					}
					var string = '';
					this.waitForSelector('table.table-bordered tbody', function() {
						var table = casper.evaluate(function() {
							return document.querySelector('table.table-bordered tbody');
						});
						this.wait(4000,function(){
							if (typeof table !== 'undefined') {
								var tr = this.evaluate(function() {
									return document.querySelectorAll('table.table-bordered tbody tr').length;
								});
								//console.log('tr length '+tr);
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
									//console.log(cell);
									string += cell+'\r\n';
								};
								string = header_string+string;
								fs.write(filename, string, 'a');
							} else {
								console.log('table undefined');
							}
						});
					});
				});
			}
		/*});
	});*/
});

casper.run(function(){
	casper.exit();
});
