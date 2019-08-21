var fs = require('fs');
var casper = require('casper').create({
	verbose: true,
	logLevel: 'debug',
	waitTimeout: '10000',
	pageSettings: {
		allowMedia: false,
		javascriptEnabled: true,
		loadImages:  false,         // The WebPage instance used by Casper will
		loadPlugins: false,         // use these settings
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
	}
});

casper.options.onResourceRequested = function(casper, requestData, request) {
	// SKIP CSS
	if ((/https?:\/\/.+?\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/css') {
		console.log('Skipping CSS file: ' + requestData['url']);
		request.abort();
	}
};

var duration = casper.cli.get('duration');
if (typeof duration === 'undefined' ) {
	duration = 24;
}

var current = casper.cli.get('current');
if (typeof current === 'undefined' ) {
	current = false;
}

casper.options.clientScripts = [
	"/var/www/html2/rumble-scripts/lib/moment/moment.min.js",
	"/var/www/html2/rumble-scripts/lib/moment/moment-timezone.min.js",
	"/var/www/html2/rumble-scripts/lib/moment/moment-timezone-with-data.min.js",
	"/var/www/html2/rumble-scripts/lib/jquery-3.2.1.min.js",
];

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
	this.echo('Console: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
	this.echo("Page Error: " + msg, "ERROR");
});
//URLs
var url = 'https://rumble.zingfitstudio.com/';
var username = 'mike.ricotta';
var password = 'M1Rumbl3!KE';
var classes = [];
var classnote = waitlist = classButton = '';
var currentSiteId = '';
var logs = '/var/www/html2/rumble-scripts/zflogs/';
var rooms = [
	{
		siteid:'12900000002',
		id:'12900000001',
		room:'FlatironChelsea',
		locale:'America/New_York'
	},
	{
		siteid:'12900000002',
		id:'12900000003',
		room:'NoHo',
		locale:'America/New_York'
	},
	{
		siteid:'12900000002',
		id:'12900000006',
		room:'UES2',
		locale:'America/New_York'
	},
	{
		siteid:'12900000002',
		id:'12900000007',
		room:'UES4',
		locale:'America/New_York'
	},
	{
		siteid:'12900000004',
		id:'12900000009',
		room:'WeHo',
		locale:'America/Los_Angeles'
	},
	{
		siteid:'751454502594283131',
		id:'751454502619448957',
		room:'FiDi',
		locale:'America/Los_Angeles'
	},
        {
                siteid:'844951477611922822',
                id:'844951477637088648',
                room:'CenterCity',
                locale:'America/New_York'
        },
        {
                siteid:'844951479021209042',
                id:'844951479029597652',
                room:'RumbleDC',
                locale:'America/New_York'
        },
];

// Login first
casper.start(url, function(){
	this.waitForSelector('form.well', function() {
		this.fillSelectors('form.well', {
			'input[name="username"]' : username,
			'input[name="password"]' : password
		}, true);
	});
	this.echo('LOGGED IN');
});

var i = ii = -1;
casper.then(function(){
	i = -1;
	// changing to default site
	this.thenOpen(url+"index.cfm?action=Register.setSite&siteid=12900000002",function(){
		this.then(function(){
			// loop through rooms
			this.each(rooms, function(){
				i++;
				var room = rooms[i];
				var roomUrl = url+"index.cfm?action=Booker.getClassesForWeek&roomid="+room.id;
				if (currentSiteId !== room.siteid) {
					this.thenOpen(url+"index.cfm?action=Register.setSite&siteid="+room.siteid,function(){
					});
					currentSiteId = room.siteid;
				}

				this.then(function(){

					this.echo(room.id);
					this.echo(room.room);
					this.echo(room.locale);
					this.echo(roomUrl);
					// Collect classes for today
					classes = this.evaluate(function(room,current,roomUrl){
						var todayClasses = [];
						console.log(roomUrl);
						$.ajax({
							type:'GET',
							async: false,
							url:roomUrl,
							dataType:"json"
						}).done(function(d){
							// var classes = d.classes;
							$.each(d.classes,function(i,c){
								var now = moment().tz(room.locale);
								var nowString = now.format("YYYY-MM-DD");
								// console.log(c.roomid+" = "+room.id);

								if(c.classdate.search(nowString) !== -1){
									var check = true;
									var currentClassDateObj = moment(c.classdate);
									// var currentClassDateObj = moment(c.classdate).tz(room.locale);
									if (current === true) {
										// check = moment(c.classdate).format("HH") == now.format("HH");
										// console.log(moment().subtract(1,"hours").tz(room.locale));
										// console.log(currentClassDateObj);
										check = (moment().subtract(1,"hours").tz(room.locale) < currentClassDateObj && currentClassDateObj < moment().add(1,"hours").tz(room.locale));
									}
									if( check ){
										// c.classdateString = moment(c.classdate).tz(room.locale).format("ddd MMM DD YYYY HH-mm-ss zZZ");
										c.classdateString = currentClassDateObj.toString().replace(/[:]/g, "-");
										// console.log(c.classdateString);
										todayClasses.push(c);
									}
								}
							});
						});
						return todayClasses;
					},{room:room,current:current,roomUrl:roomUrl});

					this.then(function(){
						ii = -1;
						this.each(classes, function(){
							ii++;
							var c = classes[ii];
							var filename = logs+'attendance/attendance_'+room.room+'_'+c.classdateString+'.csv';
							string = this.evaluate(function(c){
								var string = '';
								$.ajax({
									async: false,
									url:"https://rumble.zingfitstudio.com/index.cfm?action=Booker.getClassDetails",
									data: { classid: c.id },
									dataType:"json"
								}).done(function(d){
									var spots = d.spots;
									$.each(spots,function(i,spot){
										if(spot.attendanceid !== null){
											stat = (spot.signedin == true)?'signedin':'enrolled';
											if(spot.customerid != null && spot.customerid != "undefined"){
												string += spot.id+','+spot.spotlabel+','+stat+','+spot.customerid+','+spot.firstname+' '+spot.lastname+'\r\n';									
											}
										}
									});
								});
								return string;
							},{c:c});
							fs.write(filename, string, 'w');
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
