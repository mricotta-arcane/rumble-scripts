// "use strict";
var locations = require('../../public/data_miner/locations');
var fs = require('fs');
var moment = require('moment-timezone');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: '5000',
  pageSettings: {
    allowMedia: false,
    javascriptEnabled: true,
    loadImages: false, // The WebPage instance used by Casper will
    loadPlugins: false, // use these settings
    //userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:26.0) Gecko/20100101 Firefox/26.0'
  }
});

casper.options.onResourceRequested = function (casper, requestData, request) {
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
    //'maxcdn.bootstrapcdn.com',
    'jssdks.mparticle.com',
    'www.google.com',
    'www.googleadservices.com'
  ];

  skip.forEach(function (needle) {
    if (requestData.url.indexOf(needle) > 0) {
      request.abort();
    }
  });
};


var path = casper.cli.get('path');
if (typeof path === 'undefined' || path === null) {
  var path = "/var/www/html2/rumble-scripts/";
}

var length = casper.cli.get('length');
if (typeof length === 'undefined' || length === null) {
  var length = "day";
}

var site = casper.cli.get('site');
if (typeof site === 'undefined' || site === null || site == 'barrys') {
  var site = "barrysbootcamp_2";
}

var publicPath = path + 'public/data_miner/log/';
var file = publicPath + 'scraper_' + length;
var fileSummary = publicPath + 'summary';

// print out all the messages in the headless browser context
casper.on('remote.message', function (msg) {
  //this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function (msg, trace) {
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
  currentTime;
timeformat = 'llll';
classTZ = 'America/New_York';
var gap = {
  'barrysbootcamp': 10,
  'sbxboxing': 10,
  'soulcycle': 30
};
var forceHourCheck = true;
if (forceHourCheck === true) {
  gap = {
    'barrysbootcamp': 10,
    'sbxboxing': 60,
    'soulcycle': 60
  };
}
if (site == 'flywheel' || site == 'barrysbootcamp') {
  casper.options.clientScripts = [
    path + "lib/jquery-3.2.1.min.js"
  ];
}
casper.start('https://www.barrysbootcamp.com/', function () {
  switch (site) {
    case 'flywheel':
      currentTime = moment().tz('America/New_York').format(timeformat);
      username = 'john.j@leanfwk.com';
      password = 'Afkalh!34';
      loginUrl = 'https://www.flywheelsports.com/login';
      flywheelRegionClasses = {};
      this.thenOpen(loginUrl, function () {
        this.waitForSelector('.login form', function () {
          this.fillSelectors('.login form', {
            'input[name="username"]': username,
            'input[name="password"]': password
          }, false);
          this.then(function () {
            this.click('.login form button');
          });
        }, function () {
          console.log("Can't Login");
        });
        this.then(function () {

          classAll = this.evaluate(function (length) {
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
              url: "https://new-york.flywheelsports.com/api/v2/region.json?"
            }).done(function (d) {
              if (typeof d.error == 'undefined') {
                jQuery.each(d, function (i, v) {
                  if (v.region_subdomain !== 'dubai') {
                    jQuery.ajax({
                      async: false,
                      url: 'https://' + v.region_subdomain + '.flywheelsports.com/api/v2/classroom.json?'
                    }).done(function (dd) {
                      if (typeof dd.error == 'undefined') {
                        var url = "https://" + v.region_subdomain + ".flywheelsports.com/api/v2/class.json?region=" + v.region_subdomain + "&starttime=" + parseInt(startOfDay) + "&endtime=" + parseInt(tomorrow) + "?";
                        switch (length) {
                          case 'week':
                            url = "https://" + v.region_subdomain + ".flywheelsports.com/api/v2/class.json?region=" + v.region_subdomain + "&starttime=" + parseInt(parseInt) + "&endtime=" + parseInt(week) + "?";
                            break;
                        }
                        jQuery.ajax({
                          async: false,
                          url: url
                        }).done(function (ddd) {
                          // console.log(d);
                          if (typeof ddd.error == 'undefined') {
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
          }, {
            length: length
          });
          this.then(function () {
            this.eachThen(classAll, function (r) {
              regionClasses = r.data;
              this.eachThen(regionClasses, function (rr) {
                co = rr.data;
                lo = flyWheelgetLocation(co.class_classroom_nid);
                if (typeof lo !== 'undefined') {
                  var classCsvLineArray = [
                    currentTime,
                    co.class_format + ' ' + co.class_description + ' ' + co.class_type,
                    lo.name,
                    co.class_instructor_nid,
                    moment.unix(co.class_timestamp).tz(lo.timezone).format(timeformat),
                    co.class_duration,
                    lo.seat,
                    parseInt(lo.seat) - parseInt(co.class_spots_remaining),
                    co.class_spots_remaining,
                    co.class_nid
                  ];
                  // classAll.push(classCsvLineArray);
                  writeFile(site, classCsvLineArray, co.class_classroom_nid, lo.timezone);
                } else {
                  console.log(co.class_classroom_nid);
                }
              });
            });
          });
        });
        this.then(function () {
          this.page.close();
          this.page = require('webpage').create();
        });
      });
      break;
    case 'barrysbootcamp':
      currentTime = moment().tz('America/New_York').format(timeformat);
      this.then(function () {
        classAll = this.evaluate(function (length) {
          var apiUrl = 'https://barrysbootcamp.marianatek.com/';
          var classAll = [];
          var locations = [];
          var now = new Date();
          var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
          var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).getTime() / 1000;
          var week = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 7).getTime() / 1000;
          var todayString = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
          console.log(length);
          console.log(todayString);
          jQuery.ajax({
            async: false,
            url: apiUrl + "api/locations?page_size=100"
          }).done(function (d) {
            if (typeof d.data !== 'undefined') {
              locations = d.data;
              jQuery.each(locations, function (i, location) {
                console.log("Getting class for location: " + location.id);
                jQuery.ajax({
                  async: false,
                  url: apiUrl + "api/class_sessions",
                  data: {
                    include: "available_primary_spots,available_secondary_spots,class_session_type,standby_availability,in_booking_window",
                    location: location.id,
                    max_date: todayString,
                    min_date: todayString,
                    ordering: "start_datetime",
                    page_size: 100,
                  }
                }).done(function (dd) {
                  if (typeof dd.data !== 'undefined') {
                    classes = dd.data;
                    jQuery.each(classes, function (i, c) {
                      console.log("Getting class: " + c.id);
                      c.timezone = location.attributes.timezone;
                      c.location_id = location.id;
                      classAll.push(c);
                    });
                  };
                }).fail(function (jqXHR, textStatus) {
                  console.log(jqXHR.status);
                  console.log(textStatus);
                })
              });
            }
          });
          return classAll;
        }, {
          length: length
        });
        this.then(function () {
          this.eachThen(classAll, function (r) {
            c = r.data;
            open = c.attributes.available_spots.length;
            enrolled = c.attributes.capacity - open;
            classDate = moment.tz(c.attributes.start_datetime, c.timezone);
            var classCsvLineArray = [
              currentTime,
              c.attributes.class_type_display,
              c.attributes.classroom_display,
              c.attributes.instructor_names.join(", "),
              classDate.format(timeformat),
              c.attributes.duration,
              c.attributes.capacity,
              open,
              enrolled,
              0,
              0,
              0,
              c.id
            ];
            classAll.push(classCsvLineArray);
            writeFile(site, classCsvLineArray, c.location_id, c.timezone);
          });
        });
      });

      break;
    case 'barrysbootcampOLD':
      username = 'james.k@leanfwk.com';
      //username = 'jtyson@dadstie.com';
      password = 'Afkalh!34';
      //password = 'paxxwerd';
      loginUrl = 'https://www.barrysbootcamp.com/login/login/';
      //loginUrl = 'https://international.barrysbootcamp.com/reserve/index.cfm?action=Account.login';
      accountUrl = 'https://www.barrysbootcamp.com/'; //'https://www.barrysbootcamp.com/my-account/'
      classesUrl = 'https://www.barrysbootcamp.com/schedule/';
      var today = new Date();
      var currentDate = today.toISOString().substring(0, 10);
      casper.thenOpen(loginUrl, function () {
        this.echo('login page opened');
        this.then(function () {
          this.once('url.changed', function (uri) {
            if (uri.indexOf('mtredirect') >= 0) {
              this.echo('redirected us');
              this.thenOpen(loginUrl, function () {

              });
            }
          });
        });
        this.then(function () {
          this.wait(1000, function () {
            this.then(function () {
              /*this.waitForSelector('#international_select option:nth-of-type(2)',function(){
              	this.echo('dropdown appeared');
              	this.then(function(){
              		casper.selectOptionByValue = function(selector, valueToMatch){
              			this.evaluate(function(selector, valueToMatch){
              				var select = document.querySelector(selector),
              					found = false;
              				Array.prototype.forEach.call(select.children, function(opt, i){
              					if (!found && opt.value.indexOf(valueToMatch) !== -1) {
              						select.selectedIndex = i;
              						found = true;
              					}
              				});
              				// dispatch change event in case there is some kind of validation
              				var evt = document.createEvent("UIEvents"); // or "HTMLEvents"
              				evt.initUIEvent("change", true, true);
              				select.dispatchEvent(evt);
              			}, selector, valueToMatch);
              		};

              		casper.selectOptionByValue('#international_select', 'https://www.barrysbootcamp.com/login/login');
              	});
              	this.then(function(){
              		this.wait(3000, function(){

              		});
              	});
              	//this.click('#international_select option[value="https://www.barrysbootcamp.com/login/login"]');
              });*/
              this.then(function () {
                this.echo('checking if form exists');
                this.waitForSelector('form.MT_form-login__form', function () {
                  this.echo('form loaded 1');
                  if (casper.exists('form input[name="email"]')) {
                    this.echo('fields loaded');
                    this.fillSelectors('form.MT_form-login__form', {
                      'input[name="email"]': username,
                      'input[name="password"]': password
                      //},true);
                      //}, false);
                    });
                    //this.click('button[type="submit"]');
                    //this.click('button.MT_login__login-button');
                    this.clickLabel('Login', 'button');
                  } else {
                    this.echo('fields never loaded');
                  }
                }, function timeout() {
                  this.waitForSelector('form[name="loginForm"]', function () {
                    this.echo('form loaded 2');
                    this.fillSelectors('form[name="loginForm"]', {
                      'input[name="username"]': username,
                      'input[name="password"]': password
                      //},true);
                      //}, false);
                    });
                    //this.click('button[type="submit"]');
                    //this.click('button.MT_login__login-button');
                    this.clickLabel('Sign In', 'button');
                  }, function timeout() {
                    this.waitForSelector('button.MT_customer-loggedin__logout-button', function () {
                      this.echo('customer already logged in apparently');
                    }, function timeout() {
                      casper.then(function () {
                        this.waitForSelector('MT_create-account MT_create-account__link-text', function () {
                          this.echo('no button, no form, just this link which means JS is not running on site');
                        }, function () {
                          this.echo('nada');
                        });
                      });

                    });
                  });
                });
              });
            });
          });
          this.wait(3000, function () {
            // Do nothing
          });
        });
        // Start Type loop
        this.then(function () {
          this.eachThen(locations.all.Barrys, function (r) {
            classLocationId = r.data.studio_id;
            classLocationNameOrig = r.data.name;
            classLocationName = classLocationNameOrig.replace(/\s+/g, '-').toLowerCase();
            var barryClassTZ = r.data.timezone;
            var seats = JSON.parse(r.data.seat);
            classSeats = seats.seats;
            classFloors = seats.floors;
            this.thenOpen(classesUrl + classLocationName + '/#/week/', function () {
              this.echo('opened page');

              this.waitForSelector('.MT_schedule-week__filters', function () {
                this.wait(3500, function () {
                  var locId = this.evaluate(function () {
                    return jQuery('#mariana-schedule-week-routable-binding').attr('data-mariana-location-id');
                  });
                  classlist = this.evaluate(function (selector) {
                    var classlist = [];
                    if ($(selector).length > 0) {
                      $.each($(selector), function (i, v) {
                        var sb = $(v);
                        var rowId = sb.attr('id');
                        var classId = sb.find('.MT_button').attr('id');
                        var classTime = sb.find('.MT_schedule__time').text().trim();
                        var className = sb.find('.MT_schedule__class-name').text().trim();
                        var className = className.substring(0, className.indexOf('('));
                        var classLength = sb.find('.MT_schedule__duration').text().trim();
                        var classInstructor = sb.find('.MT_schedule__instructor-name').text().trim();
                        var month = $('.MT_week-nav__day-button:first-of-type').find('.MT_week-nav__date-month').text().trim();
                        var day = $('.MT_week-nav__day-button:first-of-type').find('.MT_week-nav__date').clone().children().remove().end().text().trim();
                        var dater = month + day;
                        var classDate = new Date().getFullYear() + '/' + dater;
                        var classFull = true;

                        if (sb.find('.MT_schedule__waitlist-button').length) {
                          classFull = true;
                        } else if (sb.find('.MT_schedule__register-button').length) {
                          classFull = 'reserve';
                        } else if (sb.find('.MT_schedule__class-cancelled').length) {
                          classFull = 'cancelled';
                        }
                        var co = {
                          'nth': i + 1,
                          'classId': classId,
                          'classTime': classTime,
                          'className': className,
                          'classInstructor': classInstructor,
                          'classLength': classLength,
                          'classDate': classDate,
                          'classFull': classFull,
                          'rowId': rowId
                        };
                        classlist.push(co);
                      });
                    }
                    return classlist;
                  }, {
                    selector: '.MT_schedule__table-body tr'
                  });
                  if (classlist !== null && classlist.length > 0) {
                    this.eachThen(classlist, function (ee) {
                      var row = ee.data;
                      if (classLocationId === 11 && forceHourCheck === false) {
                        classNow = moment().tz(barryClassTZ).add(130, 'minutes');
                      }
                      var classNow = moment().tz(barryClassTZ).add(gap[site], 'minutes');
                      var writeLog = false;
                      this.wait(3500, function () {
                        currentTime = moment().tz('America/New_York').format(timeformat);
                        classTime = moment(row.classTime, ["h:mm A"]).format("HH:mm");
                        classDate = moment(row.classDate + ' ' + classTime);
                        classDate = moment.tz(classDate.format(), 'YYYY-MM-DDTHH:mm:ss', barryClassTZ);
                        // If we are within the booking window
                        // and if there is a reserve button or a waitlist button
                        if (classNow < classDate && (row.classFull === true || row.classFull === 'reserve' || row.classFull === 'cancelled')) {
                          writeLog = true;
                        }
                        if ((row.classFull !== true || row.classFull == 'reserve') && writeLog === true) {
                          //this.waitForSelector('button#'+row.classId, function(){
                          this.waitForSelector(".MT_schedule__table-body tr:nth-of-type(" + row.nth + ") .MT_schedule__register-button", function () {
                            //this.click('button#'+row.classId);
                            this.click('.MT_schedule__table-body tr:nth-of-type(' + row.nth + ') .MT_schedule__register-button');
                            this.echo('waiting for map');
                            this.once('url.changed', function (url) {
                              if (url.indexOf('mtredirect') >= 0) {
                                this.echo('redirected us again');
                                this.then(function () {
                                  this.echo('checking if form exists');
                                  this.waitForSelector('form.MT_form-login__form', function () {
                                    this.echo('form loaded 1');
                                    if (casper.exists('form input[name="email"]')) {
                                      this.echo('fields loaded');
                                      this.fillSelectors('form.MT_form-login__form', {
                                        'input[name="email"]': username,
                                        'input[name="password"]': password
                                        //},true);
                                        //}, false);
                                      });
                                      //this.click('button[type="submit"]');
                                      //this.click('button.MT_login__login-button');
                                      this.clickLabel('Login', 'button');
                                    } else {
                                      this.echo('fields never loaded');
                                    }
                                  }, function timeout() {
                                    this.waitForSelector('form[name="loginForm"]', function () {
                                      this.echo('form loaded 2');
                                      this.fillSelectors('form[name="loginForm"]', {
                                        'input[name="username"]': username,
                                        'input[name="password"]': password
                                        //},true);
                                        //}, false);
                                      });
                                      //this.click('button[type="submit"]');
                                      //this.click('button.MT_login__login-button');
                                      this.clickLabel('Sign In', 'button');
                                    }, function timeout() {
                                      this.waitForSelector('button.MT_customer-loggedin__logout-button', function () {
                                        this.echo('customer already logged in apparently');
                                      }, function timeout() {
                                        casper.then(function () {
                                          this.waitForSelector('MT_create-account MT_create-account__link-text', function () {
                                            this.echo('no button, no form, just this link which means JS is not running on site');
                                          }, function () {
                                            this.echo('nada');
                                          });
                                        });

                                      });
                                    });
                                  });
                                });
                                this.thenOpen(classesUrl + classLocationName + '/#/week/', function () {
                                  this.echo('supposedly we are logged in and back to the previous page');
                                  this.wait(3500, function () {
                                    if (casper.exists(".MT_schedule__table-body tr(" + row.nth + ") .MT_schedule__register-button")) {
                                      this.click('.MT_schedule__table-body tr(' + row.nth + ') .MT_schedule__register-button');
                                    }
                                  });
                                });
                              }
                            });
                          }, function timeout() {
                            this.reload();
                            this.echo('that selector was not showing for no good reason, so I am refreshing');
                            this.click('.MT_schedule__table-body tr(' + row.nth + ') .MT_schedule__register-button');
                            this.once('url.changed', function (url) {
                              if (url.indexOf('mtredirect') >= 0) {
                                this.echo('redirected us again');
                                this.reload();
                                this.waitForSelector('form.MT_form-login__form', function () {
                                  this.fillSelectors('form.MT_form-login__form', {
                                    'input[name="email"]': username,
                                    'input[name="password"]': password
                                    //},true);
                                  });
                                  //this.click('button[type="submit"]');
                                  //this.click('button.MT_login__login-button');
                                  this.clickLabel('Login', 'button');
                                });
                                this.then(function () {
                                  this.page.close();
                                  this.page = require('webpage').create();
                                });
                                this.thenOpen(classesUrl + classLocationName + '/#/week/', function () {
                                  this.echo('supposedly we are logged in and back to the previous page');
                                  this.wait(3500, function () {
                                    if (casper.exists(".MT_schedule__table-body tr(" + row.nth + ") .MT_schedule__register-button")) {
                                      this.click('.MT_schedule__table-body tr(' + row.nth + ') .MT_schedule__register-button');
                                    }
                                  });
                                });
                              }
                            });
                          });
                          this.waitForSelector('.MT_layout-spot--available', function () {
                            //this.waitForSelector('#mariana-schedule-week-routable-binding', function(){
                            //var classId = this.getCurrentUrl().substr(this.getCurrentUrl().lastIndexOf('/') + 1);
                            // Refactor we need to collect floors and treads separately
                            classEnrolledFloors = 0;
                            classAvailableFloors = 0;
                            classEnrolledSeats = this.evaluate(function () {
                              return $('.MT_layout-spot--reserved').length;
                            });
                            classAvailableSeats = this.evaluate(function () {
                              return $('.MT_layout-spot--available').length;
                            });
                            var totalSpots = classSeats + classFloors;
                            if (classEnrolledSeats == totalSpots) {
                              writeLog = false;
                            }
                            /*if((classAvailableSeats.length && classAvailableSeats > 0) || (classEnrolledSeats.length && classEnrolledSeats < (classSeats + classFloors))){
                            	var writeLog = true;
                            } else {
                            	var writeLog = false;
                            }*/
                            /*classSeats = this.evaluate(function(){
                            	return $('.MT_layout-spot').length;
                            });*/
                          }, function timeout() {
                            this.waitForSelector('.MT_register-flow__pick-button', function () {
                              writeLog = false;
                            }, function timeout() {
                              writeLog = false;
                            });
                          });
                          this.back();
                        } else if (row.classFull == 'cancelled') {
                          classAvailableSeats = classSeats;
                          classAvailableFloors = classFloors;
                          classEnrolledSeats = classEnrolledFloors = 0;
                        } else if (row.classFull === true) {
                          // if class is full
                          classAvailableSeats = classAvailableFloors = 0;
                          classEnrolledSeats = classSeats;
                          classEnrolledFloors = classFloors;
                          // end if class is full
                          var classJumpChecks = moment().tz(barryClassTZ).add(240, 'minutes');
                          var classJumpChecksTwo = moment().tz(barryClassTZ).add(61, 'minutes');
                          if (classJumpChecks > classDate && classJumpChecksTwo < classDate) {
                            var writeLog = false;
                          }
                        } else {
                          writeLog = false;
                        }
                        if (writeLog === true) {
                          console.log('write log is true');
                          classCsvLineArray = [
                            currentTime, //set
                            row.className, //set
                            classLocationNameOrig, //set
                            row.classInstructor, //set
                            classDate.format(timeformat), //set
                            //classDate+' '+classTime,	//set
                            row.classLength, //set
                            classFloors, //refactor
                            classEnrolledFloors, //refactor
                            classAvailableFloors, //refactor
                            classSeats, //set
                            classEnrolledSeats, //set
                            classAvailableSeats, //set
                            //classLocationId,			//set
                            classDate.format(timeformat)
                            //classId,				//set
                            //'classTime',
                          ];
                          writeFile(site, classCsvLineArray, classLocationId, barryClassTZ);
                        }
                      });
                    });
                  } else {
                    this.echo('class list is empty');
                  }
                });
              }, function timeout() {
                this.echo('timed out but moving on');
              });

              this.then(function () {
                this.page.close();
                this.page = require('webpage').create();
              });
            });
          });
        });
        this.then(function () {
          this.page.close();
          this.page = require('webpage').create();
        });
      });
      break;
    case 'sbxboxing':
      username = 'tiger.golfer@gmail.com';
      password = 'paxxWurd';
      loginUrl = 'https://sbxboxing.zingfit.com/reserve/index.cfm?action=Account.login';
      accountUrl = 'https://sbxboxing.zingfit.com/reserve/index.cfm?action=Account.info';
      classLocations = [1, 2];
      classesUrl = 'https://sbxboxing.zingfit.com/reserve/index.cfm?action=Reserve.chooseClass&site=';
      classUrl = 'https://sbxboxing.zingfit.com/reserve/index.cfm?action=Reserve.chooseSpot&classid=';
      this.thenOpen(loginUrl, function () {
        this.waitForSelector('form[name="loginForm"]', function () {
          this.fillSelectors('form[name="loginForm"]', {
            'input[name="username"]': username,
            'input[name="password"]': password
          }, true);
          this.waitForUrl(accountUrl, function () {
            //this.echo('Logged into sbxboxing');
          });

          // Start Type loop
          this.eachThen(classLocations, function (r) {
            classLocationId = r.data;
            classAll = [];
            if (classLocationId == 1) {
              classLocationTitle = 'FLATIRON';
              classSeats = '40';
            } else if (classLocationId == 2) {
              classLocationTitle = 'DUMBO';
              classSeats = '33';
            }
            this.thenOpen(classesUrl + classLocationId, function () {
              // Set selector based on datalength
              selector = '.today .scheduleTime';
              switch (length) {
                case 'week':
                  selector = '.scheduleTime';
                  break;
              }
              // Get possible classes
              classes = this.evaluate(function (selector) {
                var classes = [];
                if ($(selector).length) {
                  $.each($(selector), function (i, v) {
                    var scheduleBlock = $(v).parent();
                    var classId = scheduleBlock.data('classid');
                    var classlenthobj = scheduleBlock.find('.classlength');
                    var classLength = classlenthobj.text().trim();
                    var tdheader = scheduleBlock.closest('table').find('thead td').eq($(v).closest('td').index());
                    scheduleBlock.find('.classlength').remove();
                    var date = tdheader.find('.thead-date').text().replace('.', '/');
                    // var datearray = date.trim().split('.');
                    // var month = datearray[0];
                    // var day = datearray[1];
                    var classTime = scheduleBlock.find('.scheduleTime').text().trim();
                    // var classdate = tdheader.find('.thead-dow').text()+' '+tdheader.find('.thead-date').text()+' '+scheduleBlock.find('.scheduleTime').text();
                    var className = scheduleBlock.find('.scheduleClass').text().trim();
                    var classInstructor = scheduleBlock.find('.scheduleInstruc').text().trim();
                    var co = {
                      'classId': classId,
                      'classLength': classLength,
                      'className': className,
                      'classInstructor': classInstructor,
                      'classTime': classTime,
                      'classDate': new Date().getFullYear() + '/' + date
                    };
                    classes.push(co);
                  });
                }
                return classes;
              }, {
                selector: selector
              });
              //this.echo('POSSIBLE CLASSES: '+classes.length);

              if (classes.length > 0) {
                // Loop through classes
                this.eachThen(classes, function (rr) {
                  currentTime = moment().tz('America/New_York').format(timeformat);
                  var classNow = moment().tz('America/New_York').add(gap[site], 'minutes');
                  var writeLog = false;
                  var co = rr.data;
                  classDate = moment(co.classDate + ' ' + co.classTime);
                  if (classNow < classDate) {
                    writeLog = true;
                  }
                  classAvailableSeats = 0;
                  classEnrolledSeats = classSeats;
                  if (writeLog === true) {
                    this.thenOpen(classUrl + co.classId, function () {
                      var currentUrl = this.getCurrentUrl();
                      if (currentUrl == classUrl + co.classId) {
                        this.waitForSelector('#spotwrapper', function () {
                          // classSeats = this.evaluate(function(){
                          //   return $('.spotcell').length;
                          // });
                          classEnrolledSeats = this.evaluate(function () {
                            return $('.spotcell.Enrolled').length;
                          });
                          classAvailableSeats = classSeats - classEnrolledSeats;
                        });
                      }
                    });
                    this.then(function () {
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
                      writeFile(site, classCsvLineArray, classLocationId);
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
        this.then(function () {
          this.page.close();
          this.page = require('webpage').create();
        });
      });
      break;
    case 'soulcycle':
      classesUrl = 'https://www.soul-cycle.com/find-a-class/studio/';
      classUrl = 'https://www.soul-cycle.com/find-a-class/select-bike/';
      soulCycleMainUrl = 'https://www.soul-cycle.com/';
      soulCycleSignInUrl = 'https://www.soul-cycle.com/signin/';
      soulcycleEmail = 'sor.net@gmail.com';
      soulcyclePassword = 'qwe123asd';
      // Login first
      this.thenOpen(soulCycleSignInUrl, function () {
        this.waitForSelector('form.login__form', function () {
          this.fillSelectors('form.login__form', {
            'input#email-input': soulcycleEmail,
            'input#password-input': soulcyclePassword
          }, true);
          this.then(function () {
            console.log('clicked ok, new location is ' + this.getCurrentUrl());
          });
          this.waitForUrl(soulCycleMainUrl, function () {
            this.echo('Logged into soulcycle');
          });
        });
      });

      this.eachThen(locations.all.SoulCycle, function (r) {
        classLocationId = r.data.studio_id;
        var soulcycleClassTZ = r.data.timezone;
        classAll = [];
        classSeats = r.data.seat;
        this.thenOpen(classesUrl + classLocationId, function () {
          this.then(function () {
            this.evaluate(function () {
              if ($('.button-cancel').length) {
                this.click('.button-cancel');
              }
            });
          });
          classLocationTitle = this.getHTML('h3.studio-title').trim();
          // Set selector based on datalength
          selector = '.today .session:not(.expired):not(.no-sessions):not(.supersoul)';
          switch (length) {
            case 'week':
              selector = '.session:not(.expired):not(.no-sessions):not(.supersoul)';
              break;
          }
          // get classes
          this.waitForSelector(selector, function () {
            classes = this.evaluate(function (selector) {
              var classes = [];
              if ($(selector).length) {
                $.each($(selector), function (i, v) {
                  var adata = $(v).find('a.reserve');
                  var classId = adata.data('class-id');
                  var classLocation = adata.data('location');
                  var classInstructor = adata.data('instructor');
                  // var studio = adata.data('studio');
                  var classType = adata.data('class-type');
                  var classTime = adata.data('class-time');
                  var classFull = false;
                  var classRoom = $(v).find('span.time b').html();
                  if ($(v).hasClass('full')) {
                    classFull = true;
                  }
                  var co = {
                    'classId': classId,
                    // 'classLocation':classLocation,
                    'classInstructor': classInstructor,
                    // 'studio':studio,
                    'className': classType,
                    'classDateTime': classTime,
                    'classFull': classFull,
                    'classRoom': classRoom,
                  };
                  classes.push(co);
                });
              }
              return classes;
            }, {
              selector: selector
            });

            // console.log(classes);
            if (classes !== null) {
              //this.echo('POSSIBLE CLASSES: '+classes.length);

              if (classes.length > 0) {
                this.eachThen(classes, function (rr) {
                  var co = rr.data;
                  var classNow = moment().tz(soulcycleClassTZ).add(gap[site], 'minutes');
                  var writeLog = false;
                  currentTime = moment().tz('America/New_York').format(timeformat);
                  classDate = moment.tz(co.classDateTime, soulcycleClassTZ);
                  if (classNow < classDate) {
                    writeLog = true;
                  }

                  // If some classes are full it's not possible to click so we have to have default class seats
                  if (classLocationId == 3) {
                    if (co.classRoom == '(A)') {
                      classSeats = 71;
                    }
                    if (co.classRoom == '(B)') {
                      classSeats = 46;
                    }
                  }
                  if (classLocationId == 4) {
                    if (co.classRoom == '(A)') {
                      classSeats = 62;
                    }
                    if (co.classRoom == '(B)') {
                      classSeats = 31;
                    }
                  }

                  // if we can't open class then it must be full, full classes redirects back to studio page
                  classAvailableSeats = 0;
                  classEnrolledSeats = classSeats;

                  // co.classId = 1031477

                  if (co.classFull !== true && writeLog === true) {
                    this.thenOpen(classUrl + co.classId, function () {
                      this.waitForSelector('.seats', function () {

                        // Get class seats
                        var classSeatsTemp = this.evaluate(function () {
                          return jQuery('.seats .seat:not(.fan, .instructor)').length;
                        });

                        // Check if class seats loading
                        if (classSeatsTemp > 0) {
                          classSeats = classSeatsTemp;
                        }

                        this.wait(1000, function () {
                          classAvailableSeats = this.evaluate(function () {
                            return jQuery('.seats .seat:not(.fan):not(.instructor):not(.taken)').length;
                          });
                          classEnrolledSeats = classSeats - classAvailableSeats;
                        });
                      }, function () {
                        this.echo("opening class failed");
                      }, 3000);
                    });
                  }
                  if (writeLog === true) {
                    this.then(function () {
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
                      writeFile(site, classCsvLineArray, classLocationId, soulcycleClassTZ);
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

          }, function timeout() {
            this.echo('timed out but moving on');
          });
          this.then(function () {
            casper.page.close();
            casper.newPage();
          });
        });
      });
      break;
    default:
      break;
  }
});

casper.run();

var getCount = function (checkStr, returnCount) {
  var r;
  if (checkStr == 'na') {
    r = parseInt(returnCount);
  } else {
    r = parseInt(checkStr);
  }
  return r;
};

var writeFile = function (site, classCsvLineArray, classLocationId, classTZ) {
  var withinTen;
  switch (site) {
    case 'barrysbootcamp_2':
      withinTen = moment().tz(classTZ).add(gap[site] + 11, 'minutes');
      if (classLocationId === 11 && forceHourCheck === false) {
        withinTen = moment().tz(classTZ).add(91, 'minutes');
      }
      break;
    case 'barrysbootcamp':
      withinTen = moment().tz(classTZ).add(gap[site] + 11, 'minutes');
      if (classLocationId === 11 && forceHourCheck === false) {
        withinTen = moment().tz(classTZ).add(131, 'minutes');
      }
      break;
    case 'soulcycle':
      withinTen = moment().tz(classTZ).add(gap[site] + 16, 'minutes');
      break;
    case 'flywheel':
      withinTen = moment().tz(classTZ).add(11, 'minutes');
      break;
    default:
    case 'sbxboxing':
      classTZ = 'America/New_York';
      withinTen = moment().tz('America/New_York').add(gap[site] + 11, 'minutes');
      break;

  }
  var fileSingle = file + '_' + site + '_' + classLocationId + '.csv';

  // Date, Name, Location, Instructor, Datetime, Length, Floors, Enrolled floors, Open floors, Seats, Enrolled seats, Open seats
  // Add header if file is new
  if (!fs.exists(fileSingle)) {
    if (site == 'barrysbootcamp' || site == 'barrysbootcamp2') {
      fs.write(fileSingle, 'Date;Name;Location;Instructor;Datetime;Length;Floors;Enrolled floors;Open floors;Treads;Enrolled treads;Open treads;Class ID \r\n', 'a');
    } else {
      fs.write(fileSingle, 'Date;Name;Location;Instructor;Datetime;Length;Seats;Enrolled seats;Open seats;Class ID \r\n', 'a');
    }
  }
  classDate = classCsvLineArray[4];

  // var classDateObj = moment(classDate);
  var classDateObj = moment(classDate).format();
  var tzclassDateObj = moment.tz(classDateObj, 'YYYY-MM-DDTHH:mm:ss', classTZ);
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
  fs.write(fileSingle, '\r\n' + classCsvLine, 'a');
};

var flyWheelgetLocation = function (studio_id) {
  for (var i = 0; i < locations.all.Flywheel.length; i++) {
    var location = locations.all.Flywheel[i];
    if (location.studio_id == studio_id) {
      return location;
    }
  }
};

var writeHTML = function (buttonId, currentTime, html) {
  var filename = buttonId + currentTime;
  if (typeof html === 'object') {
    fs.write('/home/ubuntu/' + filename, 'sorry this is an object', 'w');
  } else {
    fs.write('/home/ubuntu/' + filename, html, 'w');
  }
  /*fs.writeFile(, "Hey there!", function(err) {
  	if(err) {
  		return console.log(err);
  	}
  }*/
}
var writeSummary = function (site, classAll, classLocationId, classLocationTitle, classDay) {
  var
    classTotalSeats,
    classTotalOpenSeats,
    classTotalEnrolledSeats;
  classTotalLength = classTotalSeats = classTotalEnrolledSeats = classTotalOpenSeats = classAverageLength = 0;
  fileSummary = 'scraper_summary.csv';
  // site+'_'+classLocationId+'.csv';
  if (!fs.exists(fileSummary)) {
    fs.write(fileSummary, 'Date;Website;Location ID;Location Name;Number Classes;Number Spots;Enrolled Spots;Open Spots\r\n', 'a');
  }
  var totalClasses = getCount(classAll);
  for (i = 0; i < classAll.length; i++) {
    //var singleClassLength = parseInt(classAll[i][5].trim().replace(' Minutes',''));
    //classTotalLength = classTotalLength+singleClassLength;
    // TO avoid confusion Floors are Seats in other locations except barrys
    // ^ except that this is what is causing the confusion, so let's not do that.
    classTotalSeats = classTotalSeats + parseInt(classAll[i][6]);
    classTotalEnrolledSeats = classTotalEnrolledSeats + getCount(classAll[i][7], classAll[i][6]);
    classTotalOpenSeats = classTotalOpenSeats + getCount(classAll[i][8], 0);
  }
  if (classTotalLength !== 0 && classAll.length !== 0) {
    classAverageLength = parseFloat(classTotalLength / classAll.length).toFixed(2);
  }
  casper.then(function () {
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
    fs.write(fileSummary, classCsvLine + '\r\n', 'a');
  });
};