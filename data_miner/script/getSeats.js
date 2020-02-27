// "use strict";
var locations = require('../../public/data_miner/locations');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  waitTimeout: '10000',
  pageSettings: {
    loadImages:  false,         // The WebPage instance used by Casper will
    loadPlugins: false,         // use these settings
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
  }
});

casper.options.onResourceRequested = function(casper, requestData, request) {
  // If any of these strings are found in the requested resource's URL, skip
  // this request. These are not required for running tests.
  var skip = [
    'googleads.g.doubleclick.net',
    'cm.g.doubleclick.net',
    's.adroll.com',
    'secure.adnxs.com',
    'jssdkcdns.mparticle.com',
    'bat.bing.com',
    'connect.facebook.net',
    'www.facebook.net',
    'www.google-analytics.com',
    'platform.twitter.com',
    'js.appboycdn.com',
    'maxcdn.bootstrapcdn.com',
    'jssdks.mparticle.com',
    'www.google.com',
    'www.googleadservices.com'
  ];

  skip.forEach(function(needle) {
    if (requestData.url.indexOf(needle) > 0) {
      request.abort();
    }
  });
};

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  this.echo("Page Error: " + msg, "ERROR");
});

var links = [
  'https://www.barrysbootcamp.com/',
  'https://www.soul-cycle.com/',
  // 'http://sbxboxing.com/',
  // 'https://www.flywheelsports.com/'
];
var classLocationSeats = {};
var
username,
password,
loginUrl,
accountUrl,
classDate,
className,
classSeats,
classEnrolledSeats,
classAvailableSeats,
classFloors,
classEnrolledFloors,
classAvailableFloors,
classLength,
classes,
classesUrl,
classUrl,
classType,
classLocationTitle,
classLocationId,
sbxboxingFile,
barryFile,
soulFile,
locationSeats
;

var site = casper.cli.get('site');
if(typeof site === 'undefined' || site === null){
  var site = "barrys";
}
casper.start('https://www.barrysbootcamp.com/', function(self, link) {
  switch (site) {
    case 'barrys':
    // case 'IGNOREhttps://www.barrysbootcamp.com/':
      locationSeats = [];
      username = 'john.j@leanfwk.com';
      password = 'Afkalh!34';
      loginUrl = 'https://booking.barrysbootcamp.com/reserve/index.cfm?action=Account.login';
      accountUrl = 'https://booking.barrysbootcamp.com/reserve/index.cfm?action=Account.info';
      classesUrl = 'https://booking.barrysbootcamp.com/reserve/index.cfm?action=Reserve.chooseClass&site=';
      classUrl = 'https://booking.barrysbootcamp.com/reserve/index.cfm?action=Reserve.chooseSpot&classid=';

      this.thenOpen(loginUrl, function(){
        this.waitForSelector('form[name="loginForm"]', function() {
          this.fillSelectors('form[name="loginForm"]', {
            'input[name="username"]' : username,
            'input[name="password"]' : password
          }, true);
          this.waitForUrl(accountUrl,function(){
            this.echo('Logged into sbxboxing');
          },function(){
            this.echo('Failed to login');
          });

          // Start Type loop
          this.eachThen(locations.all.Barrys, function(r){
            classLocationId = r.data.studio_id;
            console.log('LOCATION ID: '+classLocationId);
            this.thenOpen(classesUrl+classLocationId,function(){
              // Get possible classes
              classes = this.evaluate(function(){
                var classes=[];
                if($('.tab-pane.active .scheduleBlock:not(.empty)').length){
                  $.each($('.tab-pane.active .scheduleBlock:not(.empty)'),function(i,v){
                    var sb = $(v);
                    var classId = sb.data('classid');
                    var co = {
                      'classId':classId,
                    };
                    if (sb.find('.badge.waitlist').length || sb.find('.badge.full').length) {
                    } else {
                      classes.push(co);
                    }
                  });
                }
                return classes;
              });
              //if class
              if(classes.length === 0){
                classes = this.evaluate(function(){
                  var classes=[];
                  if($('.scheduleBlock:not(.empty)').length){
                    $.each($('.scheduleBlock:not(.empty)'),function(i,v){
                      var sb = $(v);
                      var classId = sb.data('classid');
                      var co = {
                        'classId':classId,
                      };
                      if (sb.find('.badge.waitlist').length || sb.find('.badge.full').length) {
                      } else {
                        classes.push(co);
                      }
                    });
                  }
                  return classes;
                });
              }
              if(classes.length > 0){

                this.echo('POSSIBLE CLASSES: '+classes.length);

                // Find out class seats
                // Try first, third and fifth classes
                classSeats = classFloors = 'full';
                this.eachThen(classes, function(rr){
                  var co = rr.data;
                  console.log(classSeats);
                  if(classSeats == 'full'){
                    this.thenOpen(classUrl+co.classId,function(){
                      var currentUrl = this.getCurrentUrl();
                      if (currentUrl == classUrl+co.classId){
                        this.waitForSelector('.spotcell',function(){
                          classSeats = this.evaluate(function(){
                            return $('.spotcell:not(.floor)').length;
                          });
                          classFloors = this.evaluate(function(){
                            return $('.spotcell.floor').length;
                          });
                        },function(){
                          console.log('CLASS URL FAILED:'+classUrl+co.classId+'');
                          console.log('CLASS URL FAILED:'+classesUrl+classLocationId+'');
                        });
                      }
                    });
                  }
                });
                this.then(function(){
                  locationSeats.push({
                    'studio_id':classLocationId,
                    'seat':{
                      'seats':classSeats,
                      'floors':classFloors
                    }
                  });
                });
              }

            });
          });
        });
      });
      this.then(function(){
        classLocationSeats.Barrys = locationSeats;
      });
      break;
    case 'soulcycle':
      locationSeats = [];
      classesUrl = 'https://www.soul-cycle.com/find-a-class/studio/';
      classUrl = 'https://www.soul-cycle.com/find-a-class/select-bike/';
      this.eachThen(locations.all.SoulCycle, function(r){
        classLocationId = r.data.studio_id;
        console.log('LOCATION ID: '+classLocationId);
        this.thenOpen(classesUrl+classLocationId,function(){
          classes = this.evaluate(function(){
            var classes=[];
            if($('.today .session').length){
              $.each($('.today .session:not(.expired):not(.no-sessions):not(.supersoul)'),function(i,v){
                var adata = $(v).find('a.reserve');
                var classId = adata.data('class-id');
                var co = {
                  'classId':classId,
                };
                if(!$(v).hasClass('full')){
                  classes.push(co);
                }
              });
            }
            return classes;
          });
          if(classes.length === 0){
            classes = this.evaluate(function(){
              var classes=[];
              if($('.session').length){
                $.each($('.session:not(.expired):not(.no-sessions):not(.supersoul)'),function(i,v){
                  var adata = $(v).find('a.reserve');
                  var classId = adata.data('class-id');
                  var co = {
                    'classId':classId,
                  };
                  if(!$(v).hasClass('full')){
                    classes.push(co);
                  }
                });
              }
              return classes;
            });
          }
          if(classes.length > 0){

            this.echo('POSSIBLE CLASSES: '+classes.length);

            // Find out class seats
            classSeats = 'full';
            this.eachThen(classes, function(rr){
              console.log(classSeats);
              var co = rr.data;
              if(classSeats == 'full'){
                this.thenOpen(classUrl+co.classId,function(){
                  // var currentUrl = this.getCurrentUrl();
                  classSeats = this.evaluate(function(){
                    return $('.seats .seat:not(.fan):not(.instructor)').length;
                  });
                });
              }
            });
            this.then(function(){
              locationSeats.push({
                'studio_id':classLocationId,
                'seat':classSeats
              });
            });
          }

        });
      });
      this.then(function(){
        classLocationSeats.SoulCycle = locationSeats;
      });
      break;
    default:
    break;
  }
});

casper.then(function(){
  var classLocationSeatsString = JSON.stringify(classLocationSeats);

  console.log(classLocationSeatsString);
  // this.open('http://sor.local/rumble-scripts/public/data_miner/addraw.php',{
  this.open('http://rumble:RuM313d@7a@rumble-script.doyourumble.com/data_miner/addraw.php',{
    method: 'post',
    data: {
      'name':'seats',
      'data':classLocationSeatsString
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  });
});

casper.run();
