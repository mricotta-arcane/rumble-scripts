//TZ=America/New_York PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs casperjs --verbose --log-level=warning --ssl-protocol=any --ignore-ssl-errors=true --web-security=no --path=/var/www/html/rumble-staging.rumble-boxing.com/booker_looper/ /var/www/html/rumble-staging.rumble-boxing.com/booker_looper/booker_looper.js

var fs = require('fs');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: '60000',
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
}
casper.options.clientScripts = [
  path+"/moment.min.js",
  path+"/moment-timezone.min.js",
  path+"/moment-timezone-with-data.min.js"
];
// casper.echo(path);

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  this.echo("Page Error: " + msg, "ERROR");
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
var bookerUrl = adminer+'index.cfm?action=Booker.view';
var alertUrl = '';
var classes = [];
var classnote = waitlist = classButton = '';
var waitlistEmpty = dontopenStatus = classButtonClosed = bookableSpot = false;
var file = 'booker_looper.txt';
var logify = false;
var currentTime = '';
var mailerkey = 'AV5Zsslka';

casper.start(adminUrl, function(){
  this.echo("page loaded");
});

casper.waitForSelector('form.well', function() {
  this.fillSelectors('form.well', {
    'input[name="username"]' : username,
    'input[name="password"]' : password
  }, true);
  this.waitForUrl(bookerUrl);
});

//retrieve classes
casper.thenOpen(bookerUrl, function(){
  this.waitForUrl(bookerUrl, function(){
    this.echo("We're in");
    // Clicking on T after Classes so we can retrieve hour,min from url
    this.evaluate(function(){
      loadClassList('T');
    });
    this.wait(4000,function(){
      this.echo('Wait for loadClassList to finish');

    });
  });
});

// Wait for loadClassList to finish;
// wait for selector load
casper.waitForSelector('#classlist',function(){
  // collect all classes within range
  classes = this.evaluate(function(){
    var classes = [];
    var id,currentClassDate,currentClassDateObj,linktext,isPrivate,enrolled,is60;
    var now = moment().tz('America/New_York');
    var later = moment().add(168,'hours').tz('America/New_York');
    // later.setHours(later.getHours() + 168);
    // console.log('Now: '+now);
    $.each($('#classlist a'),function(i,v){
      currentClassDate = $(v).data('classdate');
      // currentClassDate = currentClassDate.replace(' ','T');
      // currentClassDate = currentClassDate+' America/New_York';
      currentClassDateObj = moment(currentClassDate);

      linktext = $(v).text();
      if(linktext.indexOf('Private')==-1){
        isPrivate = false;
      } else {
        isPrivate = true;
      }

      enrolled =$(v).parent('li').find('.enrolled').text();
      if(enrolled == 60){
        is60 = true;
      } else {
        is60 = false;
      }

      // console.log('Sooner +12: '+sooner);
      // console.log('Later +336: '+later);
      console.log('Now: '+now.format());
      console.log('later: '+later.format());
      console.log('Class Date Input: '+currentClassDate);
      console.log('Class Date Object: '+currentClassDateObj.format());
      console.log('Link Text: '+linktext);
      console.log('Is Private: '+isPrivate);
      console.log('Enrolled: '+enrolled);
      console.log('is60: '+is60);
      console.log(now < currentClassDateObj);
      console.log(currentClassDateObj < later);

      if (now < currentClassDateObj && currentClassDateObj < later && isPrivate===false && is60 === false){
        id = $(v).attr('id');
        classes.push(id);
        // console.log(id);
      }
    });
    return classes;
  });
  this.echo('POSSIBLE CLASSES: '+classes);
  // this.die();
});

casper.then(function(){
  // loop through classes
  this.eachThen(classes, function(r){
    currentClassID = r.data;
    //currentClassID = r.data.substring(5);
    //this.echo(currentClassID);
    // Click on link
    this.waitForSelector('a#'+currentClassID,function(){
    	this.click('a#'+currentClassID);
    });
    this.then(function(){
      // wait for clicked panel load
      this.waitFor(function check(){
        // checking if new panel is loaded
        return this.evaluate(function(currentClassID){
        //if($('a[onclick="loadClass('+currentClassID+', true)"]').length > 0){					// The reason this stopped loading is because they now wrap the ID in quotes
	if($('#classheader2 a.btn').attr("onclick") == "loadClass('"+currentClassID+"', true)"){
		return true;
          }
        },{
          // passing variable to evaluate
          currentClassID:currentClassID.replace('class','')
	});
      }, function then(){
	this.echo('then reached here');
        this.then(function(){
          // Check if there is DONTOPEN note
          // classnote = this.getElementAttribute('#classnote', 'value');
          classnote = casper.evaluate(function(){
            return $('#classnote').val();
          });
          if (classnote.indexOf('DONTOPEN') === -1){
            dontopenStatus = false;
          } else {
            dontopenStatus = true;
          }

          // Check if waitlist is empty
          if(this.exists('#waitlist td.yui-dt-empty>div')){
            waitlist = this.getHTML('#waitlist td.yui-dt-empty>div');
            if(waitlist.trim() == 'Wait list is empty.'){
              // this.echo("Found Empty Wait list");
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
          this.echo('Loaded Class '+currentClassID);
          this.echo('CLASSNOTE EXISTS: '+classnote+' -- '+dontopenStatus);
          this.echo('WAITLIST EMPTY: '+waitlist+' -- '+waitlistEmpty);
          this.echo('CLASS BUTTON CLOSED: '+classButton+' -- '+classButtonClosed);
          this.echo('SPOT AVAILABLE: '+bookableSpot);
          currentTime = new Date();
          if (dontopenStatus == false && bookableSpot == true && classButtonClosed == true ){
          // if (dontopenStatus == false && bookableSpot == true){
            // this should open current class
            // this.click('#classheader2 a.btn');
            // click on reopen
            // <a href="javascript:{}" onclick="openClass()" class="btn left-spacer" id="yui_3_15_0_1_1495958564377_179">Reopen class</a>
            // #classheader2 a.btn Reopen class
            var classText = this.getHTML('a#'+currentClassID);
            var classDate = this.getElementAttribute('a#'+currentClassID,'data-classdate');
            if(reOpenClass == true){
              this.echo('FOUND CLASS TO REOPEN');
              this.evaluate(function(){
                openClass();
              });
              this.then(function(){
                this.waitForSelector('.bootbox.modal',function(){
                  this.echo('MODAL OPEN');
                  this.click('.bootbox.modal a[data-handler="1"]');
                  this.then(function(){
                    this.echo('CLICKED OK');
                    this.waitForUrl(bookerUrl);
                    this.then(function() {
                      fs.write(path+'/'+file, currentTime+' | '+classDate +' | '+classText+' | Class '+currentClassID+' Reopened \n', 'a');
                    });
                  });
                });
              });
            } else {
              fs.write(path+'/'+file, currentTime+' | '+classDate +' | '+classText+' | Class '+currentClassID+' can be Reopened  \n', 'a');
            }
            this.echo('Logging');
            logify = true;
            alertUrl = 'http://rumble-script.doyourumble.com/booker_looper/alert.php?class='+classText+'&datetime='+currentTime+'&key='+mailerkey;
            this.thenOpen(alertUrl,function(){
              this.waitForSelector('.report',function(){
                fs.write(path+'/'+file, this.fetchText('.report')+' \n', 'a');
              });
            });
            this.then(function() {
              this.back();
            });
          }
          this.then(function(){
            // reset values;
            classnote = waitlist = classButton = '';
            waitlistEmpty = dontopenStatus = classButtonClosed = bookableSpot = false;
          });
          // this.die();
        });
      });
    });
  });
  this.then(function(){
    if(logify == false){
      fs.write(path+'/'+file, currentTime+' | Nothing to report,  \n', 'a');
      this.echo('Logging');
    }
  });
});


casper.run();
