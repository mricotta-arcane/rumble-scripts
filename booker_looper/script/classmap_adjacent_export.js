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
var classes = {};
var classnote = (waitlist = classButton = "");
var waitlistEmpty = (dontopenStatus = classButtonClosed = bookableSpot = false);
var currentTime = "";
var mailerkey = "AV5Zsslka";
var logs = "/var/www/html2/rumble-scripts/zflogs/";
var rooms = {
  "12900000002": ["12900000001", "12900000003", "12900000006", "12900000007"],
  "12900000004": ["12900000009"],
  "751454502594283131": ["751454502619448957"],
  "844951477611922822": ["844951477637088648"],
  "844951479021209042": ["844951479029597652"],
  "952965229287835635": ["952965229338167284"]
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
      } else if (identifier == "12900000006") {
        var room = "UES2";
      } else if (identifier == "12900000007") {
        var room = "UES4";
      } else if (identifier == "751454502619448957") {
        var room = "FiDi";
      } else if (identifier == "844951477637088648") {
        var room = "CenterCity";
      } else if (identifier == "844951479029597652") {
        var room = "RumbleDC";
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
            var cl = {};
            var id,
              currentClassDate,
              currentClassDateObj,
              linktext,
              isPrivate,
              enrolled,
              is60;
            var now = moment()
              .subtract(2, "hours")
              .tz(dd.timezone);
            var later = moment()
              .add(dd.duration, "hours")
              .tz(dd.timezone);
            //$.each($('#classlist ul#day0 a'),function(i,v){
            $.each($("#classlist ul a"), function(i, v) {
              currentClassDate = $(v).data("classdate");
              currentClassDateObj = moment(currentClassDate);

              linktext = $(v).text();
              if (linktext.indexOf("Private") == -1) {
                isPrivate = false;
              } else {
                isPrivate = true;
              }

              enrolled = $(v)
                .parent("li")
                .find(".enrolled")
                .text();
              if (typeof enrolled == "undefined") {
                this.reload(function() {
                  this.echo("refreshed because no numbers");
                });
              }
              if (typeof currentClassDateObj !== "undefined") {
                if (now < currentClassDateObj && currentClassDateObj < later) {
                  id = $(v).attr("id");
                  var classtime = currentClassDateObj
                    .toString()
                    .replace(/[:]/g, "-");
                  cl[classtime] = id;
                }
              }
            });
            return cl;
          },
          { duration: duration, timezone: locale }
        );
      });

      casper.then(function() {
        this.echo("evaluated");
        var i = 0;
        // loop through classes
        var cl = Object.keys(classes).map(function(key) {
          return classes[key];
        });
        this.eachThen(cl, function(r) {
          currentClassID = r.data;
          this.waitForSelector("a#" + currentClassID, function() {
            this.click("a#" + currentClassID);
          });
          //currentClassID = currentClassID.substr(5);
          this.then(function() {
            this.waitFor(
              function check() {
                return this.evaluate(
                  function(currentClassID) {
                    if (
                      $("#classheader2 > a.btn").attr("onclick") ==
                      "loadClass('" + currentClassID + "', true)"
                    ) {
                      return true;
                    }
                  },
                  {
                    currentClassID: currentClassID.replace("class", "")
                  }
                );
              },

              function then() {
                this.echo("after evaluated");
                this.waitForSelector(
                  "#roomlayout > #spotwrapper > #spotcell10 .spotcustomer",
                  function() {
                    casper.then(function() {
                      this.echo("ready to write");
                      var classtime = Object.keys(classes)[i];
                      i++;
                      var string = (row = "");
                      var filename =
                        logs +
                        "attendance/attendance_" +
                        room +
                        "_" +
                        classtime +
                        ".csv";
                      var header =
                        "'spotID','spotLabel','status','customerId','customerName'\r\n";
                      string = casper.evaluate(function() {
                        var row = "";
                        var spotid, spotlabel, customerid, customername, stat;
                        jQuery("#spotwrapper > span").each(function(i, v) {
                          if (typeof jQuery(v) !== "undefined") {
                            if (jQuery(v).hasClass("booked")) {
                              spotid = jQuery(v).data("spotid");
                              spotlabel = jQuery(v).data("spotlabel");
                              customerid = jQuery(v)
                                .find(".spotcustomer a")
                                .data("customerid");
                              customername = jQuery(v)
                                .find(".spotcustomer a")
                                .data("customername");
                              stat = jQuery(v).hasClass("signedin")
                                ? "signedin"
                                : "enrolled";
                              //stat = 'enrolled';
                              if (
                                customerid !== "undefined" &&
                                customerid !== null &&
                                typeof customerid !== "undefined"
                              ) {
                                row +=
                                  spotid +
                                  "," +
                                  spotlabel +
                                  "," +
                                  stat +
                                  "," +
                                  customerid +
                                  "," +
                                  customername +
                                  "\r\n";
                                //row += spotid+','+spotlabel+','+stat+'\r\n';
                              }
                            } else {
                              //row += 'nothing'+'\r\n';
                            }
                          } else {
                            //row +=  'selector is undefined';
                          }
                        });
                        return row;
                      });
                      fs.write(filename, string, "w");
                    });
                  }
                );
              }
            );
          });
        });
      });
    });
  });
});

casper.run(function() {
  casper.exit();
});
