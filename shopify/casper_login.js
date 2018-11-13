var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: 20000,
  pageSettings: {
    loadImages:  false,         // The WebPage instance used by Casper will
    loadPlugins: false,         // use these settings
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
  }
});

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  this.echo("Page Error: " + msg, "ERROR");
});

// var path = fs.absolute('');
var path = casper.cli.get('path');
if (typeof path === 'undefined' ) {
  path = "/var/www/html2/rumble-scripts/shopify/";
}

var url1 = 'https://go.tradegecko.com/account/sign_in';
var goUrl = 'https://go.tradegecko.com/';
var url2 = 'https://go.tradegecko.com/intelligence/location_report';
//var url2 = 'https://go.tradegecko.com/intelligence';

casper.start(url1, function(){
  console.log("page loaded");
});

casper.waitForSelector("form.signin", function() {
  this.fillSelectors('form.signin', {
    'input#user_email' : 'chris.merritt-lish@rumble-boxing.com',
    'input#user_password' : 'Rumbl3123!'
  }, true);
  this.then(function(){
    this.waitForUrl(goUrl);
    this.then(function() {
      this.waitForText('Welcome to TradeGecko');
      console.log("logged in");
    });
  })
});

casper.thenOpen(url2, function(){
  this.waitForUrl(url2, function(){
    console.log("onto the report page");
    //this.download("https://go.tradegecko.com/intelligence/location_report.csv?order=product_name%20asc&location_ids%5B%5D=88530","inventory_report.csv");
    this.download("https://go.tradegecko.com/intelligence/location_report.csv?order=product_name%20asc&location_ids%5B%5D=88530&type=uncommitted_stock",path+"/inventory_report.csv");
    console.log('file downloaded');
  });
});

casper.run();
