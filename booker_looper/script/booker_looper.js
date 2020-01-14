//TZ=America/New_York PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs casperjs --verbose --log-level=warning --ssl-protocol=any --ignore-ssl-errors=true --web-security=no --path=/var/www/html2/rumble-scripts/booker_looper/script/booker_looper.js

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
  path = "/var/www/html2/rumble-scripts/booker_looper/script/";
}
var notespath = "/var/www/html2/rumble-scripts/zflogs/notes";
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
/*var username = 'mricotta';
var password = 'Rumbl3123!';*/
var username = 'mike.ricotta';
var password = 'M1Rumbl3!KE';
var reOpenClass = true;
var bookerUrl = 'https://rumble.zingfitstudio.com/index.cfm?action=Booker.view';
var adminer = 'https://rumble.zingfitstudio.com/';
var adminUrl = adminer;
var bookerPage = adminer+'index.cfm?action=Booker.view';
var dashboard = adminer+'index.cfm?action=Report.dashboard';
var alertUrl = '';
var classes = [];
var classnote = waitlist = classButton = '';
var waitlistEmpty = dontopenStatus = classButtonClosed = bookableSpot = false;
var file = '/var/www/html2/rumble-scripts/public/booker_looper/booker_looper.txt';
var logify = false;
var currentTime = '';
var mailerkey = 'AV5Zsslka';
//var rooms = {FlatironChelsea:'12900000001',NoHo:'12900000003'};	// These are the 3 different types of reports that we'll loop through
var rooms = {
		'12900000002':['12900000001','12900000003','12900000006','12900000007','952965229338167284','984816588140053757','993573905954243636','1048571362064467734', '993575127981491254', '987787678122510199'],
		'12900000004':['12900000009'],
		'751454502594283131':['751454502619448957','984817802458170448','993544502935291504','993546832300737729', '993545852360328706', '987790915714156329'],
		'844951477611922822':['844951477637088648'],
		'844951479021209042':['844951479029597652'],
	};
// These are the 3 different types of reports that we'll loop through

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
	
				casper.each(rms, function(self, identifier){
					this.then(function(){
						var bookerUrl = bookerPage+"&roomid="+identifier;
						if(identifier == '12900000001') { 
							var room = 'FlatironChelsea';
						} else if(identifier == '12900000003') { 
							var room = 'NoHo';
						} else if(identifier == '12900000009') { 
							var room = 'WeHo';
						} else if(identifier == '1048571362064467734') {
							var room = 'UESTraining';
						} else if(identifier == '12900000006') { 
							var room = 'UESStudio2';
						} else if(identifier == '12900000007') { 
							var room = 'UESStudio4';
						} else if(identifier == '751454502619448957'){
							var room = 'FiDi';
						} else if(identifier == '844951477637088648'){
							var room = 'CenterCity';
						} else if(identifier == '844951479029597652'){
							var room = 'RumbleDC';
						} else if(identifier == '984816588140053757'){
							var room = 'FlatironChelseaTraining';
						} else if(identifier == '952965229338167284'){
							var room = 'Brooklyn';
						} else if(identifier == '993573905954243636'){
							var room = 'TribecaBoxing';
						} else if(identifier == '984817802458170448'){
							var room = 'MarinaTraining';
						} else if(identifier == '993544502935291504'){
							var room = 'PaloAltoBoxing';
						} else if(identifier == '993546832300737729'){
							var room = 'MarinaBoxing';
						} else if(identifier == '993575127981491254'){
							var room = 'TribecaBoxingPrivate';
						} else if(identifier == '987787678122510199'){
							var room = 'FlatironChelseaTrainingPrivate';
						} else if(identifier == '993545852360328706'){
							var room = 'PaloAltoBoxingPrivate';
						} else if(identifier == '987790915714156329'){
							var room = 'MarinaTrainingPrivate';
						}
						this.echo('room selected');
						this.thenOpen(bookerUrl, function(){
						  this.echo('booker url opened');	  
						  this.waitForUrl(bookerUrl, function(){
							this.echo(bookerUrl+' opened and loaded');
							this.evaluate(function(){
							  loadClassList('T');
							});
							this.wait(4000,function(){
							  // this.echo('Wait for loadClassList to finish');
							});
							this.waitForSelector('#classlist',function(){
							  this.echo('class list for '+bookerUrl+' loaded');
							  classes = this.evaluate(function(){
								var classes = [];
								var id,currentClassDate,currentClassDateObj,linktext,isPrivate,enrolled,is60;
								var now = moment().tz('America/New_York');
								var later = moment().add(168,'hours').tz('America/New_York');
								$.each($('#classlist a'),function(i,v){
								  currentClassDate = $(v).data('classdate');
								if(typeof currentClassDate != 'undefined'){
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
								  if(enrolled == 60){
									is60 = true;
								  } else {
									is60 = false;
								  }
								  if (now < currentClassDateObj && currentClassDateObj < later && isPrivate===false && is60 === false){
									id = $(v).attr('id');
									classes.push(id);
								  }
								}
								});
								return classes;
							  });
								this.echo(classes);
							});
							this.then(function(){
							  this.eachThen(classes, function(r){
								currentClassID = r.data;
								this.waitForSelector('a#'+currentClassID,function(){
								  this.click('a#'+currentClassID);
								});
								this.then(function(){
								  this.waitFor(function check(){
									return this.evaluate(function(currentClassID){
									  if($('#classheader2 a.btn').attr("onclick") == "loadClass('"+currentClassID+"', true)"){
										return true;
									  }
									},{
									  currentClassID:currentClassID.replace('class','')
									});
								  }, function then(){
									this.then(function(){
									  classnote = '';
									  classnote = casper.evaluate(function(){
										return $('#classnote').val();
									  });
									  if (classnote.indexOf('DONTOPEN') === -1){
										dontopenStatus = false;
									  } else {
										dontopenStatus = true;
										console.log(classnote);
									  }
										var classDate = casper.fetchText('#classheader2');
										classDate = classDate.substr(0,21);
										var classtime = classDate.replace(/([~!@#$%^&*()_+=`{}\[\]\|\\:;'<>,.\/? ])+/g, '-').replace(/^(-)+|(-)+$/g,'');
										fs.write(notespath+'/'+room+classtime+'.txt', classnote, 'w');

									  // Check if waitlist is empty
									  if(this.exists('#waitlist td.yui-dt-empty>div')){
										waitlist = this.getHTML('#waitlist td.yui-dt-empty>div');
										if(waitlist.trim() == 'Wait list is empty.'){
										  waitlistEmpty = true;
										} else {
										  waitlistEmpty = false;
										}
									  } else {
										waitlistEmpty = false;
									  }

									  // Check if class is closed
									  classButton = this.getHTML('#classheader2 span.label');
									  if(classButton.trim() != 'Open'){
										classButtonClosed = true;
									  } else {
										classButtonClosed = false;
									  }

									  // check if bookable spot available
									  if (this.exists('#spotwrapper span.spot.bookable')) {
										bookableSpot = true;
									  } else {
										bookableSpot = false;
									  }

									});

									this.then(function(){
									  currentTime = new Date();
									  if (dontopenStatus == false && bookableSpot == true && classButtonClosed == true ){
										var classText = this.getHTML('a#'+currentClassID);
										var classDate = this.getElementAttribute('a#'+currentClassID,'data-classdate');
										if(reOpenClass == true){
										  this.evaluate(function(){
											openClass();
										  });
										  this.then(function(){
											this.waitForSelector('.bootbox.modal',function(){
											  this.click('.bootbox.modal a[data-handler="1"]');
											  this.then(function(){
												this.waitForUrl(bookerUrl);
												this.then(function() {
												  fs.write(file, currentTime+' | '+classDate +' | '+classText+' | Class '+currentClassID+' from '+room+' Reopened \n', 'a');
												});
											  });
											});
										  });
										} else {
										  fs.write(file, currentTime+' | '+classDate +' | '+classText+' | Class '+currentClassID+' from '+room+' can be Reopened  \n', 'a');
										}
										logify = true;
										alertUrl = 'http://rumble-script.arcanestrategies.com/booker_looper/alert.php?class='+classText+'&datetime='+currentTime+'&key='+mailerkey;
										this.thenOpen(alertUrl,function(){
										  this.waitForSelector('.report',function(){
											fs.write(file, this.fetchText('.report')+' \n', 'a');
										  });
										});
										this.then(function() {
										  this.back();
										});
									  }
									  this.then(function(){
										classnote = waitlist = classButton = '';
										waitlistEmpty = dontopenStatus = classButtonClosed = bookableSpot = false;
									  });
									});
								  });
								});
							  });
							  this.then(function(){
								if(logify == false){
								  fs.write(file, room+' '+currentTime+' | Nothing to report,  \n', 'a');
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

casper.run();
