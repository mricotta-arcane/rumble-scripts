//TZ=America/New_York PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs casperjs --verbose --log-level=warning --ssl-protocol=any --ignore-ssl-errors=true --web-security=no --path=/var/www/html/rumble-staging.rumble-boxing.com/booker_looper/ /var/www/html/rumble-staging.rumble-boxing.com/booker_looper/booker_looper.js

var fs = require("fs");
var casper = require("casper").create({
  verbose: true,
  logLevel: "debug",
  waitTimeout: 45000,
  // clientScripts: ,
  pageSettings: {
    loadImages: false, // The WebPage instance used by Casper will
    loadPlugins: false, // use these settings
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4"
  }
});

function getQuarter() {
  var currentMonth = new Date().getMonth();
  return Math.floor((currentMonth + 3) / 3);
}

var dates = {
  1: {startDate: '1%2F1%2F', endDate: '3%2F31%2F'},
  2: {startDate: '3%2F1%2F', endDate: '6%2F30%2F'},
  3: {startDate: '6%2F1%2F', endDate: '9%2F30%2F'},
  4: {startDate: '9%2F1%2F', endDate: '12%2F31%2F'},
};

// var path = fs.absolute('');
var path = casper.cli.get("path");
if (typeof path === "undefined") {
  path = "/var/www/html2/rumble-scripts/booker_looper/script";
}
casper.options.clientScripts = [
  /*path+"/moment.min.js",
  path+"/moment-timezone.min.js",
  path+"/moment-timezone-with-data.min.js"*/
];

// print out all the messages in the headless browser context
casper.on("remote.message", function(msg) {
  // this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  // this.echo("Page Error: " + msg, "ERROR");
});

var url = "https://rumble.zingfitstudio.com/";
var username = "mike.ricotta";
var password = "M1Rumbl3!KE";

var adminer = "https://rumble.zingfitstudio.com/";
var adminUrl = adminer;
var reportURL = adminer + "index.cfm?action=Report.";
var attendanceReportURL = reportURL + "attendanceExport&roomid="; // This accepts 2 variables, the first is the roomid and the second is a period of time
var salesReportURL = reportURL + "allSalesByDate"; // This accepts 1 variables, the date range
var attendanceReports = {
  FlatironChelsea: "12900000001",
  NoHo: "12900000003",
  UESPrivate: "12900000005",
  UESStudio2: "12900000006",
  UESTraining: "1048571362064467734",
  UESStudio4: "12900000007",
  UESSaunas: "12900000004",
  WeHo: "12900000009",
  Private: "12900000002",
  WeHoPrivate: "12900000008",
  FiDi: "751454502619448957",
  FiDiPrivate: "751468540971713538",
  CenterCity: "844951477637088648",
  CenterCityPrivate: "844966363280705427",
  RumbleDC: "844951479029597652",
  RumbleDCPrivate: "844966101287700144",
  RumbleDCSaunas: "847915540683949408",
  Brooklyn: "952965229338167284",
  BrooklynPrivate: "952969853440886204",
  FlatironChelseaTraining: "984816588140053757",
  MarinaTraining: "984817802458170448",
  MarinaBoxing: "993546832300737729",
  PaloAltoBoxing: "993544502935291504",
  TribecaBoxing: "993573905954243636",
  TribecaBoxingPrivate: "993575127981491254",
  FlatironChelseaTrainingPrivate: "987787678122510199",
  PaloAltoBoxingPrivate: "993545852360328706",
  MarinaTrainingPrivate: "987790915714156329",
};
var roomsRegions = {
  "12900000001": "12900000002",
  "12900000002": "12900000002",
  "12900000005": "12900000002",
  "12900000006": "12900000002",
  "12900000007": "12900000002",
  "12900000004": "12900000002",
  "12900000003": "12900000002",
  "1048571362064467734": "12900000002",
  "12900000009": "12900000004",
  "12900000008": "12900000004",
  "751454502619448957": "751454502594283131",
  "751468540971713538": "751454502594283131",
  "844951479029597652": "844951479021209042",
  "844951477637088648": "844951477611922822",
  "844966363280705427": "844951477611922822",
  "844966101287700144": "844951479021209042",
  "847915540683949408": "844951479021209042",
  "952965229338167284": "12900000002",
  "952969853440886204": "12900000002",
  "984816588140053757": "12900000002",
  "993573905954243636": "12900000002",
  "984817802458170448": "751454502594283131",
  "993544502935291504": "751454502594283131",
  "993546832300737729": "751454502594283131",
  "993575127981491254": "12900000002",
  "987787678122510199": "12900000002",
  "993545852360328706": "751454502594283131",
  "987790915714156329": "751454502594283131",
};

var file = "zingfit_report_download.log";
var logs = "/var/www/html2/rumble-scripts/zflogs/";
var currentDate = new Date().getDate().toString(); // Gets full date
var currentMonth = new Date().getMonth();
var lastMonth = new Date().getMonth().toString(); // For some reason, getMonth goes from 0, so this month is actually getMonth+1, last month is getMonth
var currentMonth = currentMonth + 1;
var currentMonth = currentMonth.toString(); // Gets numeric month
var currentYearFull = new Date().getFullYear().toString(); // Gets full year
var currentYear = currentYearFull.substr(-2); // Gets 2 digit year
var eom = new Date(currentYearFull, currentMonth, 0).toString().substr(8, 2); // end of this month
var eolm = new Date(currentYearFull, lastMonth, 0).toString().substr(8, 2); // end of last month
var bookerUrl = "https://rumble.zingfitstudio.com/index.cfm?action=Booker.view";

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
  this.thenOpen(
    "https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard",
    function() {
      this.waitForUrl(
        "https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard"
      );
    }
  );
});

casper.then(function() {
  // This is all 3 of the class attendance reports
  this.eachThen(Object.keys(attendanceReports), function(res) {
    var index = res.data;
    this.echo("Starting: " + index + " at: " + new Date());
    //  For each of the attendance reports, execute for this current entire year.
    var identifier = attendanceReports[index];
    var regionselector = roomsRegions[identifier];
    var setRegion =
      adminer +
      "index.cfm?action=Register.setSite&siteid=" +
      regionselector +
      "&returnurl=%2Findex%2Ecfm%3Faction%3DReport%2Edashboard";
    this.thenOpen(setRegion, function() {
      this.waitForUrl(
        "https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard"
      );
    });
    /*this.thenOpen(
      attendanceReportURL +
        identifier +
        "&start=7%2F1%2F" +
        currentYear +
        "&end=12%2F31%2F" +
        currentYear,
      function() {}
    );*/
    this.then(function() {
      this.wait(30000, function(){
        var hlf = getQuarter();
        var startdate = dates[hlf].startDate;
        var enddate = dates[hlf].endDate;
        var reportpage =
            attendanceReportURL +
            identifier +
            "&start=" +
            startdate +
            currentYear +
            "&end=" +
            enddate +
            currentYear +
            "&export=csv";
        //casper.download(reportpage,logs+"attendance/attendance_"+index+"_"+currentMonth+"-"+currentYear+".csv");
        // Get full year data
        casper.download(
            reportpage,
            logs +
            "attendance/attendance_" +
            index +
            "_" +
            currentYear +
            "-" +
            hlf +
            ".tmp.csv"
        );

        // Only store full year data if it is valid
        var fileSizeInBytes = fs.size(
            logs +
            "attendance/attendance_" +
            index +
            "_" +
            currentYear +
            "-" +
            hlf +
            ".tmp.csv"
        );
        var contents = fs.read(
            logs +
            "attendance/attendance_" +
            index +
            "_" +
            currentYear +
            "-" +
            hlf +
            ".tmp.csv"
        );
        var substr = contents.indexOf("System Error");
        if (fileSizeInBytes > 200 && substr == -1) {
          // if filesize is greater than 500 and does not contain string
          if (
              fs.exists(
                  logs +
                  "attendance/attendance_" +
                  index +
                  "_" +
                  currentYear +
                  "-" +
                  hlf +
                  ".csv"
              )
          ) {
            fs.remove(
                logs +
                "attendance/attendance_" +
                index +
                "_" +
                currentYear +
                "-" +
                hlf +
                ".csv"
            );
          }
          fs.move(
              logs +
              "attendance/attendance_" +
              index +
              "_" +
              currentYear +
              "-" +
              hlf +
              ".tmp.csv",
              logs +
              "attendance/attendance_" +
              index +
              "_" +
              currentYear +
              "-" +
              hlf +
              ".csv"
          );
        }
      });
    });
  });
});

casper.run(function() {
  casper.exit();
});
