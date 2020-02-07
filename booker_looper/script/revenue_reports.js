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
var bookerUrl = 'https://rumble.zingfitstudio.com/index.cfm?action=Booker.view';
var regions = ['12900000002','12900000004','751454502594283131','844951477611922822','844951479021209042'];
// These are all the revenue reports that we'll loop through
// From Database
var revenueReportsAll = {
	12900000001:"1 Class  - New York",
	12900000003:"10 Pack",
	12900000004:"20 Pack",
	12900000005:"50 Pack",
	12900000006:"FIRST TIME - NEW YORK",
	12900000007:"5 Classes - New York",
	12900000008:"10 Classes - New York",
	12900000009:"20 Classes - New York",
	12900000010:"30 Classes - New York",
	12900000011:"RUMBLE-PLATINUM 10 - New York",
	12900000013:"Private Training Session - New York",
	12900000014:"Private Training 10 Pack - New York",
	12900000017:"Tandem Training  Add a Friend - New York",
	12900000019:"Private Studio Rental",
	12900000020:"Bag Blocks",
	12900000021:"1 PPX Class",
	12900000022:"5 PPX Classes",
	12900000023:"10 PPX Classes",
	12900000024:"20 PPX Classes",
	12900000025:"30 PPX Classes",
	12900000026:"50 PPX Classes",
	12900000027:"5 Classes  Valerie GoldinRemm&39s Friends",
	12900000028:"PreLaunch 10",
	12900000029:"PreLaunch 20",
	12900000030:"PreLaunch 50",
	12900000033:"PureWow Exclusive Class",
	12900000039:"PT Room Grab & Go Booking",
	12900000040:"FIRST TIME Event Promo - New York",
	470281771213128948:"RUMBLE PLATINUM - New York",
	471670307338323159:"1 Extension Comp - New York",
	471671629903038087:"1 Trainer Guest Comp - New York",
	471672107516823262:"1 Employee Class - New York",
	471673212397159453:"1 Invite Comp - New York",
	476240665043272775:"1 Employee Guest Comp - New York",
	477366776947016741:"1 Class On Us - New York",
	480224080117630065:"1 Dev Comp - New York",
	490456395028628584:"1 PPX Class Unlimited",
	490707127401187054:"1 Extension Comp Special 30 - New York",
	496286077124871494:"1 Event Class - New York",
	507833759148541921:"1 Holiday Class",
	642891123567625433:"First Time - Los Angeles",
	644403618396505232:"1 Class - Los Angeles",
	644406525644768762:"5 Classes - Los Angeles",
	644407737974785983:"10 Classes - Los Angeles",
	644410759392003310:"20 Classes - Los Angeles",
	644411522872772109:"30 Classes - Los Angeles",
	646944111307261781:"RUMBLE PLATINUM - LOS ANGELES",
	652099671006644181:"1 Class On Us - Los Angeles",
	652100191402329467:"1 Dev Comp - Los Angeles",
	652100558949189385:"1 Employee Class - Los Angeles",
	652100866383283261:"1 Employee Guest Comp - Los Angeles",
	652101696687703880:"1 Extension Comp - Los Angeles",
	652102230530327978:"1 Extension Comp Special 30 - Los Angeles",
	652102709997995906:"1 Invite Comp - Los Angeles",
	652103140828513622:"1 Trainer Guest Comp - Los Angeles",
	652113868062983744:"1 PPX Class - Los Angeles",
	652117029997774392:"1 PPX Class Unlimited - Los Angeles",
	652118086433899972:"5 PPX Classes - Los Angeles",
	652118169548228093:"10 PPX Classes - Los Angeles",
	652119710795564628:"20 PPX Classes - Los Angeles",
	652120377849283585:"30 PPX Classes - Los Angeles",
	652122110205887878:"50 PPX Classes - Los Angeles",
	659303288050550460:"Private Training Session - Los Angeles",
	659303509081982762:"Private Training 10 Pack - Los Angeles",
	670231878590006548:"1 Infrared Sauna Session",
	672456139576706776:"Tandem Training  Add a Friend - Los Angeles",
	674648582707480403:"5 Infrared Sauna Sessions",
	674648993858323498:"10 Infrared Sauna Sessions",
	674650704094168963:"20 Infrared Sauna Sessions",
	674651647728682280:"30 Infrared Sauna Sessions",
	720775485834921161:"First Time - Infrared Sauna Session",
	751454502837552773:"1 Class",
	751454502871107206:"10 Classes",
	763632640518522700:"FIRST TIME - SAN FRANCISCO",
	846277506662139187:"FIRST TIME - PHILADELPHIA",
	846568640030442962:"1 CLASS - PHILADELPHIA",
	846569957788484919:"5 CLASSES - PHILADELPHIA",
	846571003856291768:"10 CLASSES - PHILADELPHIA",
	846573931505649506:"20 CLASSES - PHILADELPHIA",
	846575928187290732:"30 CLASSES - PHILADELPHIA",
	846576870580290599:"RUMBLE PLATINUM - PHILADELPHIA",
	847665778655233080:"FIRST TIME - WASHINGTON DC",
	850012296146060616:"1 CLASS - WASHINGTON DC",
	850013071320548460:"5 CLASSES - WASHINGTON DC",
	850013940682327939:"10 CLASSES - WASHINGTON DC",
	850014806378284789:"20 CLASSES - WASHINGTON DC",
	850015225582191970:"30 CLASSES - WASHINGTON DC",
	850017096149501564:"RUMBLE PLATINUM - WASHINGTON DC",
	997732085126923398:'FIRST TIME TRAINING (2 for 1) - New York',
	996482703719138841:'FIRST TIME TRAINING (2 for 1) - San Francisco',
	1048452886918334119:"Rumble Program - 12 Classes - NY",
	1048453671530005991:"Rumble Program - 16 Classes - NY",
	1048454098107500495:"Rumble Program - 20 Classes - NY",
	1048455289675711835:"Rumble Program - 12 Classes - SF",
	1048455704005838620:"Rumble Program - 16 Classes - SF",
	1048456072332838058:"Rumble Program - 20 Classes - SF",
	1048456714162014085:"Rumble Program - 12 Classes - LA",
	1048457120875284468:"Rumble Program - 16 Classes - LA",
	1048457477357569102:"Rumble Program - 20 Classes - LA",
	1048457916962571783:"Rumble Program - 12 Classes - DC",
	1048458482983896104:"Rumble Program - 16 Classes - DC",
	1048458792078935433:"Rumble Program - 20 Classes - DC",
	1048459255012657015:"Rumble Program - 12 Classes - PA",
	1048459624832828716:"Rumble Program - 16 Classes - PA",
	1048459982405633640:"Rumble Program - 20 Classes - PA",
}
	
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
			this.eachThen(Object.keys(revenueReportsAll), function(res){
				var index = res.data;
				var identifier = revenueReportsAll[index];
				this.echo("Starting: " + index + "-" + identifier + " at: " + new Date());
				var revenueURL = reportURL+'earnedSeriesRevenueDetail&type=series&gatewayid=12900000001&seriesid='+index+'&start=1%2F1%2F'+currentYear+'&end=12%2F31%2F'+currentYear;
				var filename = logs+'revenue/RevenueReport_'+index+'_'+identifier+'.csv';
				if(index == 'FirstTime'){
					var revenueURL = reportURL+'earnedSeriesRevenueDetail&type=series&gatewayid=12900000001&seriesid='+index+'&start='+currentMonth+'%2F1%2F'+currentYear+'&end='+currentMonth+'%2F'+eom+'%2F'+currentYear;
					var filename = logs+'revenue/RevenueReport_'+index+'_'+identifier+'_this-month-src.csv';
				}
				this.thenOpen(revenueURL, function(){
					this.wait(30000, function (){
						//this.clearCache();
						//this.clearMemoryCache();
						var header_string = '';
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
						this.waitForSelector('table.table-bordered tbody', function() {
							var table = casper.evaluate(function() {
								return document.querySelector('table.table-bordered tbody');
							});
							this.wait(10000,function(){
								if (typeof table !== 'undefined') {
									var tr = this.evaluate(function() {
										return document.querySelectorAll('table.table-bordered tbody tr').length;
									});
									//console.log('tr length '+tr);
									var string = '';
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
									fs.write(filename, string, 'w');
								} else {
									console.log('table undefined');
								}
							});
						});
					});
				});
			});
		/*});
	});*/
});

casper.run(function(){
	casper.exit();
});
