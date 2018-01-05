var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  waitTimeout: '10000',
  pageSettings: {
    loadImages:  false,         // The WebPage instance used by Casper will
    loadPlugins: false,         // use these settings
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
  }
});


var studiosUrl;
var classLocationId;
var studios={};

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  this.echo("Page Error: " + msg, "ERROR");
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
  //  var path = "D:/sor/rumble-scripts/";
}

casper.options.clientScripts = [
  path+"lib/jquery-3.2.1.min.js"
];
var links = [
  'https://www.flywheelsports.com/',
  'https://www.barrysbootcamp.com/',
  'https://www.soul-cycle.com/',
  // 'http://sbxboxing.com/',
];
casper.start().each(links, function(self, link) {
  self.thenOpen(link, function() {
    switch (link) {
      case 'https://www.flywheelsports.com/':
        this.then(function(){
          // this.page.injectJs('https://code.jquery.com/jquery-3.2.1.min.js');
          studios.Flywheel = this.evaluate(function(){
            var studios = [];
            jQuery.ajax({
              async: false,
              url:"https://new-york.flywheelsports.com/api/v2/region.json?"
            }).done(function(d){
              jQuery.each(d,function(i,v){
                jQuery.ajax({
                  async: false,
                  url:'https://'+v.region_subdomain+'.flywheelsports.com/api/v2/classroom.json?'
                }).done(function(dd){
                  jQuery.each(dd,function(ii,vv){
                    studios.push(
                      {
                        'id':vv.classroom_nid,
                        'location':vv.classroom_region.region_pretty_name,
                        'name':vv.classroom_name,
                        'timezone':vv.classroom_region.region_timezone,
                        'seat':vv.classroom_capacity,
                        'region':vv.classroom_region.region_subdomain,
                        'status':1
                      }
                    );
                  });
                });
              });
            });
            return studios;
          });
        });

        // https://new-york.flywheelsports.com/api/v2/classroom.json?
        // https://new-york.flywheelsports.com/api/v2/class.json?region=new-york
        // https://new-york.flywheelsports.com/api/v2/class.json?region=new-york&starttime=1497844800&endtime=149793119

        break;
      case 'https://www.barrysbootcamp.com/':
        studiosUrl = 'https://www.barrysbootcamp.com/studios/';
        this.thenOpen(studiosUrl,function(){
          studios.Barrys = this.evaluate(function(){
            var studioElements = jQuery('.usa .studio-list .row');
            var studios=[];
            var getTZ = function(location){
              var timezone = '';
              jQuery.ajax({
                async: false,
                url:"https://maps.googleapis.com/maps/api/geocode/json?address="+location
              }).done(function(d){
                if(d.status == 'OK'){
                  var latlng = d.results[0].geometry.location;
                  jQuery.ajax({
                    async: false,
                    url:"https://maps.googleapis.com/maps/api/timezone/json?location="+latlng.lat+","+latlng.lng+"&timestamp=1458000000"
                  }).done(function(d){
                    if(d.status == 'OK'){
                      console.log(d.timeZoneId);
                      timezone = d.timeZoneId;
                      // timezone = timeZoneId;
                    }
                  });
                }
              });
              return timezone;
            };
            jQuery.each(studioElements,function(i,v){
              var t = jQuery(v);
              var id;
              var url = t.find('.studio-actions a.hero:not(.disabled)').attr('href');
              if (typeof url !== 'undefined'){
                id = url.match(/\d+$/)[0];
              }
              var name = t.find('.col-studio-name').text().trim();
              var location = t.closest('.location-group').find('h3').text().trim();
              var timezone = getTZ(location);
              console.log(timezone);
              studios.push(
                {
                  'id':id,
                  'location':location,
                  'name':name,
                  'timezone':timezone,
                  'status':1
                }
              );
            });
            console.log(JSON.stringify(studios));
            return studios;
          });
        });
        break;
      case 'https://www.soul-cycle.com/':
        studiosUrl = 'https://www.soul-cycle.com/studios/all/';
        this.thenOpen(studiosUrl,function(){
          studios.SoulCycle = this.evaluate(function(){
            var studioElements = $('.studio-detail');
            var studios=[];
            $.each(studioElements,function(i,v){
              var t = jQuery(v);
              var id = t.data('studio-id');
              var name = t.find('.name').text().trim();
              var location = t.closest('.studio-blocks').prev('.region-header').text();
              var getTZ = function(location){
                var timezone = '';
                jQuery.ajax({
                  async: false,
                  url:"https://maps.googleapis.com/maps/api/geocode/json?address="+location
                }).done(function(d){
                  if(d.status == 'OK'){
                    var latlng = d.results[0].geometry.location;
                    jQuery.ajax({
                      async: false,
                      url:"https://maps.googleapis.com/maps/api/timezone/json?location="+latlng.lat+","+latlng.lng+"&timestamp=1458000000"
                    }).done(function(d){
                      if(d.status == 'OK'){
                        console.log(d.timeZoneId);
                        timezone = d.timeZoneId;
                        // timezone = timeZoneId;
                      }
                    });
                  }
                });
                return timezone;
              };
              var timezone = getTZ(location);
              studios.push(
                {
                  'id':id,
                  'location':location,
                  'name':name,
                  'timezone':timezone,
                  'status':1
                }
              );
            });
            return studios;
          });
        });
        break;
      default:
        break;
    }
  });


});

casper.then(function(){
  var studiosString = JSON.stringify(studios);

  console.log(studiosString);

  // this.open('http://sor.local/rumble-scripts/public/data_miner/addraw.php',{
  this.open('http://rumble:RuM313d@7a@rumble-script.arcanestrategies.com/data_miner/addraw.php',{
    method: 'post',
    data: {
      'name':'studios',
      'data':studiosString
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  });
});

casper.run();
