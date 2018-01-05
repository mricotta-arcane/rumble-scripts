// "use strict";
var locations = require('../../public/data_miner/locations');
var fs = require('fs');
var moment = require('moment-timezone');
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


var path = casper.cli.get('path');
if(typeof path === 'undefined' || path === null){
  var path = "/var/www/html2/rumble-scripts/";
}

var length = casper.cli.get('length');
if(typeof length === 'undefined' || length === null){
  var length = "day";
}

var site = casper.cli.get('site');
if(typeof site === 'undefined' || site === null || site == 'barrys'){
  var site = "barrysbootcamp";
}

var publicPath = path+'public/data_miner/log/';
var file = publicPath+'scraper_'+length;
var fileSummary = publicPath+'summary';

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
  //this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  //this.echo("Page Error: " + msg, "ERROR");
});

var classLocations = [];
var classAll = [];
var
username,
password,
loginUrl,
accountUrl,
classTZ,
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
classTotalLength,
classAverageLength,
classTotalSeats,
classTotalEnrolledSeats,
classTotalOpenSeats,
selector,
currentTime
;
timeformat = 'llll';
classTZ = 'America/New_York';
var gap = {
  'barrysbootcamp':15,
  'sbxboxing':10,
  'soulcycle':30
};
var forceHourCheck = true;
if (forceHourCheck === true) {
  gap = {
    'barrysbootcamp':60,
    'sbxboxing':60,
    'soulcycle':60
  };
}
if (site == 'flywheel'){
  casper.options.clientScripts = [
    path+"lib/jquery-3.2.1.min.js"
  ];
}
casper.start('https://www.barrysbootcamp.com/',function() {
  switch (site) {
    case 'flywheel':
      currentTime = moment().tz('America/New_York').format(timeformat);
      username = 'john.j@leanfwk.com';
      password = 'Afkalh!34';
      loginUrl = 'https://www.flywheelsports.com/login';
      flywheelRegionClasses = {};
      this.thenOpen(loginUrl, function(){
        this.waitForSelector('.login form', function() {
          this.fillSelectors('.login form', {
            'input[name="username"]' : username,
            'input[name="password"]' : password
          }, false);
          this.then(function(){
            this.click('.login__button');
          });
        },function() {
          console.log("Can't Login");
        });
        this.then(function(){

          classAll = this.evaluate(function(length){
            // var length = length;
            var classAll = [];
            // var now = Math.round(+new Date()/1000);
            var now = new Date();
            var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
            // var startOfDay = new Date().getTime() / 1000;
            var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).getTime() / 1000;
            var week = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 7).getTime() / 1000;
            console.log(length);
            console.log(parseInt(startOfDay));
            console.log(parseInt(tomorrow));
            console.log(parseInt(week));

            jQuery.ajax({
              async: false,
              url:"https://new-york.flywheelsports.com/api/v2/region.json?"
            }).done(function(d){
              if(typeof d.error =='undefined'){
                jQuery.each(d,function(i,v){
                  if (v.region_subdomain !== 'dubai') {
                    jQuery.ajax({
                      async: false,
                      url:'https://'+v.region_subdomain+'.flywheelsports.com/api/v2/classroom.json?'
                    }).done(function(dd){
                      if(typeof dd.error =='undefined' ){
                        var url = "https://"+v.region_subdomain+".flywheelsports.com/api/v2/class.json?region="+v.region_subdomain+"&starttime="+parseInt(startOfDay)+"&endtime="+parseInt(tomorrow)+"?";
                        switch (length) {
                          case 'week':
                            url = "https://"+v.region_subdomain+".flywheelsports.com/api/v2/class.json?region="+v.region_subdomain+"&starttime="+parseInt(parseInt)+"&endtime="+parseInt(week)+"?";
                          break;
                        }
                        jQuery.ajax({
                          async: false,
                          url: url
                        }).done(function(ddd){
                          // console.log(d);
                          if(typeof ddd.error =='undefined'){
                            // console.log(ddd);
                            classAll.push(ddd);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
            // console.log(classAll);
            return classAll;
          },{length:length});
          this.then(function(){
            this.eachThen(classAll,function(r){
              regionClasses = r.data;
              this.eachThen(regionClasses,function(rr){
                co = rr.data;
                lo = flyWheelgetLocation(co.class_classroom_nid);
                if(typeof lo !== 'undefined'){
                  var classCsvLineArray = [
                    currentTime,
                    co.class_format+' '+co.class_description+' '+co.class_type,
                    lo.name,
                    co.class_instructor_nid,
                    moment.unix(co.class_timestamp).tz(lo.timezone).format(timeformat),
                    co.class_duration,
                    lo.seat,
                    parseInt(lo.seat)-parseInt(co.class_spots_remaining),
                    co.class_spots_remaining,
                    co.class_nid
                  ];
                  // classAll.push(classCsvLineArray);
                  writeFile(site,classCsvLineArray,co.class_classroom_nid,lo.timezone);
                } else {
                  console.log(co.class_classroom_nid);
                }
              });
            });
          });
        });
      });
      break;
    case 'barrysbootcamp':
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
            //this.echo('Logged into sbxboxing');
          },function(){
            this.echo('Failed to login');
          });

          // Start Type loop
          this.eachThen(locations.all.Barrys, function(r){
            classLocationId = r.data.studio_id;
            var barryClassTZ = r.data.timezone;
            classAll = [];
            var seats = JSON.parse(r.data.seat);
            classSeats = seats.seats;
            classFloors = seats.floors;
            this.thenOpen(classesUrl+classLocationId,function(){
              classLocationTitle = this.getHTML('.page-header.classes h1').trim();
              // Set selector based on datalength
              selector = '.tab-pane.active .scheduleBlock:not(.empty)';
              switch (length) {
                case 'week':
                  selector = '.scheduleBlock:not(.empty)';
                  break;
              }
              // Get possible classes
              classes = this.evaluate(function(selector){
                var classes=[];
                if($(selector).length){
                  $.each($(selector),function(i,v){
                    var sb = $(v);
                    var classId = sb.data('classid');
                    var classTime = sb.find('.scheduleTime').text().trim();
                    var className = sb.find('.scheduleClass').text().trim();
                    var classInstructor = sb.find('.scheduleInstruc').text().trim();
                    var classLength = sb.find('.classlength').text().trim();
                    var classDate = sb.siblings('h3').text().trim();
                    var classFull = false;
                    if (sb.find('.badge.waitlist').length || sb.find('.badge.full').length) {
                      classFull = true;
                    }
                    var co = {
                      'classId':classId,
                      'classTime':classTime,
                      'className':className,
                      'classInstructor':classInstructor,
                      'classLength':classLength,
                      'classDate':classDate,
                      'classFull':classFull,
                    };
                    classes.push(co);
                  });
                }
                return classes;
              },{
                selector:selector
              });
              if(classes !== null){
                //this.echo('POSSIBLE CLASSES: '+classes.length);

                // Loop through classes
                this.eachThen(classes, function(rr){
                  var co = rr.data;
                  var classNow = moment().tz(barryClassTZ).add(gap[site],'minutes');
                  if (classLocationId === 11 && forceHourCheck === false) {
                    classNow = moment().tz(barryClassTZ).add(60,'minutes');
                  }
                  var writeLog = false;
                  currentTime = moment().tz('America/New_York').format(timeformat);
                  classDate = moment(co.classDate+' '+co.classTime);
                  classDate = moment.tz(classDate.format(),'YYYY-MM-DDTHH:mm:ss', barryClassTZ);

                  if(classNow < classDate ){
                    writeLog = true;
                  }
                  // if class is full
                  classAvailableSeats = classAvailableFloors = 0;
                  classEnrolledSeats = classSeats;
                  classEnrolledFloors = classFloors;
                  if (co.classFull !== true && writeLog === true) {
                    this.thenOpen(classUrl+co.classId,function(){
                      var currentUrl = this.getCurrentUrl();
                      if (currentUrl == classUrl+co.classId){
                        // classSeats = this.evaluate(function(){
                        //   return $('.spotcell:not(.floor)').length;
                        // });
                        classEnrolledSeats = this.evaluate(function(){
                          return $('.spotcell.Enrolled:not(.floor)').length;
                        });
                        classAvailableSeats = classSeats - classEnrolledSeats;

                        // classFloors = this.evaluate(function(){
                        //   return $('.spotcell.floor').length;
                        // });
                        classEnrolledFloors = this.evaluate(function(){
                          return $('.spotcell.Enrolled.floor').length;
                        });
                        classAvailableFloors = classFloors - classEnrolledFloors;
                      }
                    });
                  }
                  if(writeLog === true){
                    this.then(function(){
                      var classCsvLineArray = [
                        currentTime,
                        co.className,
                        classLocationTitle,
                        co.classInstructor,
                        classDate.format(timeformat),
                        co.classLength,
                        classFloors,
                        classEnrolledFloors,
                        classAvailableFloors,
                        classSeats,
                        classEnrolledSeats,
                        classAvailableSeats,
                        co.classId
                      ];
                      classAll.push(classCsvLineArray);
                      writeFile(site,classCsvLineArray,classLocationId,barryClassTZ);
                    });
                  }


                });

              }
              // Write Summary File
              // this.then(function(){
              //   if(length !== 'day'){
              //     writeSummary(site,classAll,classLocationId,classLocationTitle,classDay);
              //   }
              // });
            });
          });
        });
      });
      break;
    case 'sbxboxing':
      username = 'tiger.golfer@gmail.com';
      password = 'paxxWurd';
      loginUrl = 'https://sbxboxing.zingfit.com/reserve/index.cfm?action=Account.login';
      accountUrl = 'https://sbxboxing.zingfit.com/reserve/index.cfm?action=Account.info';
      classLocations = [1,2];
      classesUrl = 'https://sbxboxing.zingfit.com/reserve/index.cfm?action=Reserve.chooseClass&site=';
      classUrl = 'https://sbxboxing.zingfit.com/reserve/index.cfm?action=Reserve.chooseSpot&classid=';
      this.thenOpen(loginUrl, function(){
        this.waitForSelector('form[name="loginForm"]', function() {
          this.fillSelectors('form[name="loginForm"]', {
            'input[name="username"]' : username,
            'input[name="password"]' : password
          }, true);
          this.waitForUrl(accountUrl,function(){
            //this.echo('Logged into sbxboxing');
          });

          // Start Type loop
          this.eachThen(classLocations, function(r){
            classLocationId = r.data;
            classAll = [];
            if(classLocationId == 1){
              classLocationTitle = 'FLATIRON';
              classSeats = '40';
            } else if (classLocationId == 2){
              classLocationTitle = 'DUMBO';
              classSeats = '33';
            }
            this.thenOpen(classesUrl+classLocationId,function(){
              // Set selector based on datalength
              selector = '.today .scheduleTime';
              switch (length) {
                case 'week':
                  selector = '.scheduleTime';
                  break;
              }
              // Get possible classes
              classes = this.evaluate(function(selector){
                var classes=[];
                if($(selector).length){
                  $.each($(selector),function(i,v){
                    var scheduleBlock = $(v).parent();
                    var classId = scheduleBlock.data('classid');
                    var classlenthobj = scheduleBlock.find('.classlength');
                    var classLength = classlenthobj.text().trim();
                    var tdheader = scheduleBlock.closest('table').find('thead td').eq($(v).closest('td').index());
                    scheduleBlock.find('.classlength').remove();
                    var date = tdheader.find('.thead-date').text().replace('.','/');
                    // var datearray = date.trim().split('.');
                    // var month = datearray[0];
                    // var day = datearray[1];
                    var classTime = scheduleBlock.find('.scheduleTime').text().trim();
                    // var classdate = tdheader.find('.thead-dow').text()+' '+tdheader.find('.thead-date').text()+' '+scheduleBlock.find('.scheduleTime').text();
                    var className = scheduleBlock.find('.scheduleClass').text().trim();
                    var classInstructor = scheduleBlock.find('.scheduleInstruc').text().trim();
                    var co = {
                      'classId':classId,
                      'classLength':classLength,
                      'className':className,
                      'classInstructor':classInstructor,
                      'classTime':classTime,
                      'classDate':new Date().getFullYear()+'/'+date
                    };
                    classes.push(co);
                  });
                }
                return classes;
              },{
                selector:selector
              });
              //this.echo('POSSIBLE CLASSES: '+classes.length);

              if(classes.length>0){
                // Loop through classes
                this.eachThen(classes, function(rr){
                  currentTime = moment().tz('America/New_York').format(timeformat);
                  var classNow = moment().tz('America/New_York').add(gap[site],'minutes');
                  var writeLog = false;
                  var co = rr.data;
                  classDate = moment(co.classDate+' '+co.classTime);
                  if(classNow < classDate ){
                    writeLog = true;
                  }
                  classAvailableSeats = 0;
                  classEnrolledSeats = classSeats;
                  if (writeLog === true) {
                    this.thenOpen(classUrl+co.classId,function(){
                      var currentUrl = this.getCurrentUrl();
                      if (currentUrl == classUrl+co.classId){
                        this.waitForSelector('#spotwrapper',function(){
                          // classSeats = this.evaluate(function(){
                          //   return $('.spotcell').length;
                          // });
                          classEnrolledSeats = this.evaluate(function(){
                            return $('.spotcell.Enrolled').length;
                          });
                          classAvailableSeats = classSeats - classEnrolledSeats;
                        });
                      }
                    });
                    this.then(function(){
                      var classCsvLineArray = [
                        currentTime,
                        co.className,
                        classLocationTitle,
                        co.classInstructor,
                        classDate.format(timeformat),
                        co.classLength,
                        classSeats,
                        classEnrolledSeats,
                        classAvailableSeats,
                        co.classId
                      ];
                      classAll.push(classCsvLineArray);
                      writeFile(site,classCsvLineArray,classLocationId);
                    });
                  }
                });

                // Write Summary File
                // this.then(function(){
                //   if(length !== 'day'){
                //     writeSummary(site,classAll,classLocationId,classLocationTitle,classDay);
                //   }
                // });

              }
            });
          });
        });
        // this.echo(this.getTitle());
      });
      break;
    case 'soulcycle':
      classesUrl = 'https://www.soul-cycle.com/find-a-class/studio/';
      classUrl = 'https://www.soul-cycle.com/find-a-class/select-bike/';
      this.eachThen(locations.all.SoulCycle, function(r){
        classLocationId = r.data.studio_id;
        var soulcycleClassTZ = r.data.timezone;
        classAll = [];
        classSeats = r.data.seat;
        this.thenOpen(classesUrl+classLocationId,function(){
          classLocationTitle = this.getHTML('h3.studio-title').trim();
          // Set selector based on datalength
          selector = '.today .session:not(.expired):not(.no-sessions):not(.supersoul)';
          switch (length) {
            case 'week':
              selector = '.session:not(.expired):not(.no-sessions):not(.supersoul)';
              break;
          }
          // get classes
          this.wait(2000, function() {
            classes = this.evaluate(function(selector){
              var classes=[];
              if($(selector).length){
                $.each($(selector),function(i,v){
                  var adata = $(v).find('a.reserve');
                  var classId = adata.data('class-id');
                  var classLocation = adata.data('location');
                  var classInstructor = adata.data('instructor');
                  // var studio = adata.data('studio');
                  var classType = adata.data('class-type');
                  var classTime = adata.data('class-time');
                  var classFull = false;
                  var classRoom = $(v).find('span.time b').html();
                  if($(v).hasClass('full')){
                    classFull = true;
                  }
                  var co = {
                    'classId':classId,
                    // 'classLocation':classLocation,
                    'classInstructor':classInstructor,
                    // 'studio':studio,
                    'className':classType,
                    'classDateTime':classTime,
                    'classFull':classFull,
                    'classRoom':classRoom,
                  };
                  classes.push(co);
                });
              }
              return classes;
            },{
              selector:selector
            });

            // console.log(classes);
            if(classes !== null){
              //this.echo('POSSIBLE CLASSES: '+classes.length);

              if (classes.length>0) {
                this.eachThen(classes, function(rr){
                  var co = rr.data;
                  var classNow = moment().tz(soulcycleClassTZ).add(gap[site],'minutes');
                  var writeLog = false;
                  currentTime = moment().tz('America/New_York').format(timeformat);
                  classDate = moment.tz(co.classDateTime, soulcycleClassTZ);
                  if(classNow < classDate ){
                    writeLog = true;
                  }
                  if(classLocationId == 3){
                    if (co.classRoom == '(A)') {
                      classSeats = 71;
                    }
                    if (co.classRoom == '(B)') {
                      classSeats = 46;
                    }
                  }
                  if(classLocationId == 4){
                    if (co.classRoom == '(A)') {
                      classSeats = 62;
                    }
                    if (co.classRoom == '(B)') {
                      classSeats = 31;
                    }
                  }

                  classAvailableSeats = 0;
                  classEnrolledSeats = classSeats;
                  if(co.classFull !== true && writeLog === true){
                    this.thenOpen(classUrl+co.classId,function(){
                      this.waitForSelector('.seats',function(){
                        // classSeats = this.evaluate(function(){
                        //   return $('.seats .seat:not(.fan):not(.instructor)').length;
                        // });
                        this.wait(2000, function() {
                          classAvailableSeats = this.evaluate(function(){
                            return jQuery('.seats .seat:not(.fan):not(.instructor):not(.taken)').length;
                          });
                          classEnrolledSeats = classSeats - classAvailableSeats;
                        });
                      },function(){
                        this.echo("opening class failed");
                      });
                    });
                  }
                  if(writeLog === true){
                    this.then(function(){
                      //https://www.soul-cycle.com/about/soul-classes/
                      classLength = '45 Minutes';
                      switch (co.className) {
                        case 'SoulCycle':
                        classLength = '45 Minutes';
                        break;
                        case 'SoulSurvivor':
                        classLength = '60 Minutes';
                        break;
                        case 'SoulChallenge':
                        classLength = '90 Minutes';
                        break;
                        default:
                      }
                      var classCsvLineArray = [
                        currentTime,
                        co.className,
                        classLocationTitle,
                        co.classInstructor,
                        classDate.format(timeformat),
                        classLength,
                        classSeats,
                        classEnrolledSeats,
                        classAvailableSeats,
                        co.classId
                      ];
                      classAll.push(classCsvLineArray);
                      writeFile(site,classCsvLineArray,classLocationId,soulcycleClassTZ);
                    });
                  }

                });

                // Write Summary File
                // this.then(function(){
                //   if(length !== 'day'){
                //     writeSummary(site,classAll,classLocationId,classLocationTitle,classDay);
                //   }
                // });

              }
            }

          });
        });
      });
      break;
    default:
      break;
  }
});

casper.run();

var getCount = function(checkStr,returnCount){
  var r;
  if (checkStr == 'na') {
    r = parseInt(returnCount);
  } else {
    r = parseInt(checkStr);
  }
  return r;
};

var writeFile = function(site,classCsvLineArray,classLocationId,classTZ){
  var withinTen;
  var fileSingle = file+'_'+site+'_'+classLocationId+'.csv';
  switch (site) {
    case 'barrysbootcamp':
      withinTen = moment().tz(classTZ).add(gap[site]+11,'minutes');
      if (classLocationId === 11 && forceHourCheck === false) {
        withinTen = moment().tz(classTZ).add(71,'minutes');
      }
      break;
    case 'soulcycle':
      withinTen = moment().tz(classTZ).add(gap[site]+16,'minutes');
      break;
    case 'flywheel':
      withinTen = moment().tz(classTZ).add(11,'minutes');
      break;
    default:
    case 'sbxboxing':
      classTZ = 'America/New_York';
      withinTen = moment().tz('America/New_York').add(gap[site]+11,'minutes');
      break;

  }

  // Date, Name, Location, Instructor, Datetime, Length, Floors, Enrolled floors, Open floors, Seats, Enrolled seats, Open seats
  // Add header if file is new
  if (!fs.exists(fileSingle)) {
    if(site == 'barrysbootcamp'){
      fs.write(fileSingle,'Date;Name;Location;Instructor;Datetime;Length;Floors;Enrolled floors;Open floors;Treads;Enrolled treads;Open treads;Class ID \r\n', 'a');
    } else {
      fs.write(fileSingle,'Date;Name;Location;Instructor;Datetime;Length;Seats;Enrolled seats;Open seats;Class ID \r\n', 'a');
    }
  }
  classDate = classCsvLineArray[4];

  // var classDateObj = moment(classDate);
  var classDateObj = moment(classDate).format();
  var tzclassDateObj = moment.tz(classDateObj,'YYYY-MM-DDTHH:mm:ss', classTZ);
  // var classDateObj = moment.tz(classDate, classTZ);
  var now = moment().tz(classTZ);
  // console.log(classTZ);
  // console.log(now);
  // console.log(classDate);
  // console.log(classDateObj);
  // console.log(tzclassDateObj);
  // console.log(withinTen);
  if (now <= tzclassDateObj && tzclassDateObj <= withinTen) {
    classCsvLineArray.push('TRUE');
  }

  var classCsvLine = classCsvLineArray.join(';');
  fs.write(fileSingle,'\r\n'+classCsvLine, 'a');
};

var flyWheelgetLocation = function(studio_id){
  for (var i = 0; i < locations.all.Flywheel.length; i++) {
    var location = locations.all.Flywheel[i];
    if(location.studio_id == studio_id){
      return location;
    }
  }
};

var writeSummary = function(site,classAll,classLocationId,classLocationTitle,classDay){
  var
  classTotalSeats,
  classTotalOpenSeats,
  classTotalEnrolledSeats;
  classTotalLength = classTotalSeats = classTotalEnrolledSeats = classTotalOpenSeats = classAverageLength = 0;
  fileSummary = 'scraper_summary.csv';
  // site+'_'+classLocationId+'.csv';
  if (!fs.exists(fileSummary)) {
      fs.write(fileSummary,'Date;Website;Location ID;Location Name;Number Classes;Number Spots;Enrolled Spots;Open Spots\r\n', 'a');
  }
  var totalClasses = getCount(classAll);
  for (i=0; i<classAll.length; i++){
    //var singleClassLength = parseInt(classAll[i][5].trim().replace(' Minutes',''));
    //classTotalLength = classTotalLength+singleClassLength;
    // TO avoid confusion Floors are Seats in other locations except barrys
	// ^ except that this is what is causing the confusion, so let's not do that.
    classTotalSeats = classTotalSeats + parseInt(classAll[i][6]);
    classTotalEnrolledSeats = classTotalEnrolledSeats + getCount(classAll[i][7],classAll[i][6]);
    classTotalOpenSeats = classTotalOpenSeats + getCount(classAll[i][8],0);
  }
  if(classTotalLength!==0 && classAll.length !==0){
    classAverageLength = parseFloat(classTotalLength/classAll.length).toFixed(2);
  }
  casper.then(function() {
    classCsvLineArray = [
      //parseFloat(classTotalLength/60).toFixed(2),
      //classAverageLength,
	  classDay,
	  site,
	  classLocationId,
	  classLocationTitle,
	  totalClasses,
      classTotalSeats,
      classTotalEnrolledSeats,
      classTotalOpenSeats
	  ];
    classCsvLine = classCsvLineArray.join(';');
    fs.write(fileSummary,classCsvLine+'\r\n', 'a');
  });
};
