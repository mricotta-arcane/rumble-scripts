//TZ=America/New_York PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs casperjs --verbose --log-level=warning --ssl-protocol=any --ignore-ssl-errors=true --web-security=no --path=/var/www/html/rumble-staging.rumble-boxing.com/booker_looper/ /var/www/html/rumble-staging.rumble-boxing.com/booker_looper/booker_looper.js

var fs = require("fs");
var casper = require("casper").create({
  verbose: true,
  logLevel: "debug",
  waitTimeout: "10000",
  // clientScripts: ,
  pageSettings: {
    loadImages: false, // The WebPage instance used by Casper will
    loadPlugins: false, // use these settings
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4"
  }
});

// var path = fs.absolute('');
var path = casper.cli.get("path");
if (typeof path === "undefined") {
  path = "/var/www/html/rumble-boxing.com/booker_looper";
}
var notespath = "/var/www/html2/rumble-scripts/zflogs/notes";

var duration = casper.cli.get("duration");
if (typeof duration === "undefined") {
  duration = 24;
}

casper.options.clientScripts = [
  "/var/www/html2/rumble-scripts/booker_looper/script/moment.min.js",
  "/var/www/html2/rumble-scripts/booker_looper/script/moment-timezone.min.js",
  "/var/www/html2/rumble-scripts/booker_looper/script/moment-timezone-with-data.min.js",
  "/var/www/html2/rumble-scripts/lib/jquery-3.2.1.min.js"
];
// casper.echo(path);

// print out all the messages in the headless browser context
casper.on("remote.message", function(msg) {
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
var url = "https://rumble.zingfitstudio.com/";
/*var username = 'scriptmanager';
var password = 'paxxwerd17';*/
var username = "mike.ricotta";
var password = "M1Rumbl3!KE";
var reOpenClass = true;
var bookerUrl = "https://rumble.zingfitstudio.com/index.cfm?action=Booker.view";
var adminer = "https://rumble.zingfitstudio.com/";
var adminUrl = adminer;
var bookerPage = adminer + "index.cfm?action=Booker.view";
var attendanceLog = adminer + "index.cfm?action=Booker.attendanceLog&classid=";
var dashboard = adminer + "index.cfm?action=Report.dashboard";
var alertUrl = "";
var classnote = (waitlist = classButton = "");
var classes = [];
var waitlistEmpty = (dontopenStatus = classButtonClosed = bookableSpot = false);
var currentTime = "";
var mailerkey = "AV5Zsslka";
var logs = "/var/www/html2/rumble-scripts/zflogs/";
var rooms = {
  "12900000002": ["12900000001", "12900000003", "12900000006", "12900000007", "952965229338167284", "984816588140053757", "993573905954243636","1048571362064467734","993575127981491254","987787678122510199"],
  "12900000004": ["12900000009"],
  "751454502594283131": ["751454502619448957", "984817802458170448", "993544502935291504", "993546832300737729","993545852360328706","987790915714156329"],
  "844951477611922822": ["844951477637088648"],
  "844951479021209042": ["844951479029597652"]
};
var locale = "America/New_York";

casper.start(adminUrl, function() {
  // this.echo("page loaded");
});

casper.waitForSelector("form.well", function() {
  this.fillSelectors(
    "form.well",
    {
      'input[name="username"]': username,
      'input[name="password"]': password
    },
    true
  );
});

casper.then(function() {
  var ur = this.getCurrentUrl();
  if (ur.indexOf("chooseSite") >= 0) {
    this.echo("url redirected");
    this.waitForSelector('form[name="siteform"]', function() {
      this.then(function() {
        this.click('input[value="12900000001"]');
      });
      this.then(function() {
        this.click('button[type="submit"]');
      });
    });
  }
});

casper.then(function() {
  casper.thenOpen(bookerUrl, function() {
    this.once("url.changed", function(url) {
      this.echo("url changed");
      var ur = this.getCurrentUrl();
      if (ur.indexOf("chooseSite") >= 0) {
        this.echo("url redirected");
        this.waitForSelector('form[name="siteform"]', function() {
          this.then(function() {
            this.click('input[value="12900000001"]');
          });
          this.then(function() {
            this.click('button[type="submit"]');
          });
        });
      }
    });
  });
  this.thenOpen(bookerUrl, function() {
    this.waitForUrl(bookerUrl);
  });
});

casper.then(function() {
  Object.keys(rooms).forEach(function(index) {
    var rms = rooms[index];
    var setRegion =
      adminer +
      "index.cfm?action=Register.setSite&siteid=" +
      index +
      "&returnurl=%2Findex%2Ecfm%3Faction%3DReport%2Edashboard";
    casper.thenOpen(setRegion, function() {
      this.waitForUrl(dashboard, function() {
        // Do nothing
      });
    });

    casper.each(rms, function(self, identifier) {
      var bookerUrl = bookerPage + "&roomid=" + identifier;
      //console.log(bookerUrl);
      var locale = "America/New_York";
      if (identifier == "12900000001") {
        var room = "FlatironChelsea";
      } else if (identifier == "12900000003") {
        var room = "NoHo";
      } else if (identifier == "12900000009") {
        var room = "WeHo";
        var locale = "America/Los_Angeles";
      } else if(identifier == '1048571362064467734') {
      	var room = 'UESTraining';
      } else if (identifier == "12900000006") {
        var room = "UES2";
      } else if (identifier == "12900000007") {
        var room = "UES4";
      } else if (identifier == "751454502619448957") {
        var room = "FiDi";
	var locale = "America/Los_Angeles";
      } else if (identifier == "844951477637088648") {
        var room = "CenterCity";
      } else if (identifier == "844951479029597652") {
        var room = "RumbleDC";
      } else if (identifier == "952965229338167284") {
        var room = "Brooklyn";
      } else if (identifier == "984816588140053757") {
		var room = "FlatironChelseaTraining";
	} else if (identifier == "984817802458170448"){
		var room = "MarinaTraining";
		var locale = "America/Los_Angeles";
	} else if (identifier == "993544502935291504"){
		var room = "PaloAltoBoxing";
	} else if (identifier == "993573905954243636"){
		var room = "TribecaBoxing";
	} else if(identifier == '993546832300737729'){
        var room = 'MarinaBoxing';
		var locale = "America/Los_Angeles";
    } else if(identifier == '993575127981491254'){
        var room = 'TribecaBoxingPrivate';
    } else if(identifier == '987787678122510199'){
        var room = 'FlatironChelseaTrainingPrivate';
    } else if(identifier == '993545852360328706'){
        var room = 'PaloAltoBoxingPrivate';
        var locale = "America/Los_Angeles";
    } else if(identifier == '987790915714156329'){
        var room = 'MarinaTrainingPrivate';
        var locale = "America/Los_Angeles";
    }

      this.echo("room selected");
      //retrieve classes
      casper.thenOpen(bookerUrl, function() {
        this.echo("booker url opened");
        this.waitForUrl(bookerUrl, function() {
          this.echo(bookerUrl + " opened and loaded");
          this.evaluate(function() {
            loadClassList("T");
          });
          this.wait(4000, function() {
            //this.echo('Wait for loadClassList to finish');
          });
        });
      });
      casper.waitForSelector("#classlist ul#day0", function() {
        classes = this.evaluate(
          function(dd) {
            var cl = [];
            var currentClassDate, currentClassDateObj, linktext;
            var now = moment()
              .subtract(2, "hours")
              .tz(dd.timezone);
            var later = moment()
              .add(dd.duration, "hours")
              .tz(dd.timezone);
            $.each($("#classlist ul a"), function(i, v) {
              currentClassDate = $(v).data("classdate");
              currentClassDateObj = moment(currentClassDate);
              linktext = $(v).text();
              if (typeof currentClassDateObj !== "undefined") {
                if (now < currentClassDateObj && currentClassDateObj < later) {
                  var parts = linktext.split("-");
                  var instructor = parts[1];
                  var classtime = currentClassDateObj.toString();
                  var sclasstime = classtime.substring(
                    0,
                    classtime.length - 17
                  );
                  sclasstime = sclasstime + parts[0];
                  var classtime = classtime.replace(/[:]/g, "-");
                  var filename =
                    dd.logs +
                    "header/attendance_" +
                    dd.room +
                    "_" +
                    classtime +
                    ".csv";
                  var string =
                    sclasstime + "," + instructor + ", (45 min) ," + dd.room;
                  cl.push({ f: filename, s: string });
                }
              }
            });
            return cl;
          },
          { duration: duration, timezone: locale, room: room, logs: logs }
        );
        this.then(function() {
          this.eachThen(classes, function(r) {
            fs.write(r.data.f, r.data.s, "w");
          });
        });
      }, function then(){
		// do nothing
	}, function timeout(){
		// do nothing
	});
    });
  });
});

casper.run(function() {
  casper.exit();
});
