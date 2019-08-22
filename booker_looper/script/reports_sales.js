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

// var path = fs.absolute('');
var path = casper.cli.get("path");
if (typeof path === "undefined") {
  path = "/var/www/html/rumble-scripts/booker_looper/script";
}
casper.options.clientScripts = [
  /* path+"/moment.min.js",
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

var username = "mike.ricotta";
var password = "M1Rumbl3!KE";

var adminer = "https://rumble.zingfitstudio.com/";
var adminUrl = adminer;
var reportURL = adminer + "index.cfm?action=Report.";
var attendanceReportURL = reportURL + "attendanceExport&roomid="; // This accepts 2 variables, the first is the roomid and the second is a period of time
var salesReportURL = reportURL + "allSalesByDate"; // This accepts 1 variables, the date range

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
var regions = [
  "12900000002",
  "12900000004",
  "751454502594283131",
  "844951477611922822",
  "844951479021209042",
  "952965229287835635"
];

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
  casper.each(regions, function(self, rgn) {
    var setRegion =
      adminer +
      "index.cfm?action=Register.setSite&siteid=" +
      rgn +
      "&returnurl=%2Findex%2Ecfm%3Faction%3DReport%2Edashboard";
    casper.thenOpen(setRegion, function() {
      this.waitForUrl(
        "https://rumble.zingfitstudio.com/index.cfm?action=Report.dashboard"
      );
    });
    casper.then(function() {
      if (rgn == "12900000002") {
        var loc = "NY";
      } else if (rgn == "12900000004") {
        var loc = "LA";
      } else if (rgn == "751454502594283131") {
        var loc = "SF";
      } else if (rgn == "844951477611922822") {
        var loc = "PA";
      } else if (rgn == "844951479021209042") {
        var loc = "DC";
      } else {
        var loc = "NY";
      }
      // REFACTOR: For January months, we'll have to deduct current Year by 1.
      var currentYearX = currentYear;
      if (lastMonth == 12) {
        var currentYearX = currentYear - 1;
      }
      var salesreport =
        salesReportURL +
        "&start=" +
        lastMonth +
        "%2F1%2F" +
        currentYearX +
        "&end=" +
        lastMonth +
        "%2F" +
        eolm +
        "%2F" +
        currentYearX;
      var reportpage = salesreport + "&go=GO";
      var reportexport = salesreport + "&export=csv";
      if (currentDate <= 2) {
        casper.thenOpen(reportpage, function() {
          casper.download(
            reportexport,
            logs +
              "sales/sales_" +
              loc +
              "_" +
              lastMonth +
              "-" +
              currentYearX +
              ".csv"
          );
        });
      }
      // This is the sales report which runs one month at a time but runs for the whole month, which is fine.  We need to know exact end of month day (ie. 28th, 30th, 31st) or it won't run
      var salesreport2 =
        salesReportURL +
        "&start=" +
        currentMonth +
        "%2F1%2F" +
        currentYear +
        "&end=" +
        currentMonth +
        "%2F" +
        eom +
        "%2F" +
        currentYear;
      var reportpage2 = salesreport2 + "&go=GO";
      var reportexport2 = salesreport2 + "&export=csv";
      casper.thenOpen(reportpage2, function() {
        casper.download(
          reportexport2,
          logs +
            "sales/sales_" +
            loc +
            "_" +
            currentMonth +
            "-" +
            currentYear +
            ".csv"
        );
      });
    });
  });
});

casper.run(function() {
  casper.exit();
});
