
var fs = require('fs');
var crypto = require('crypto');

var redis = require('redis');
var jade = require('jade');
var strftime = require('strftime');
var base58 = require('base58-native');
var express = require('express');

var utils = require('./utils');
var cron = require('./cron');
var config = require('./config');


var db = redis.createClient();
var app = express();

app.use(express.logger('dev'));

app.get('/', function(req, res) {
  var next = utils.nextEvent();
  var nextkey = strftime('%Y%m%d', next);
  db.get('gabiko:'+nextkey, function(err, count) {
    res.status(200).send((count*.1)+'\n');
  });
});

app.get('/:token', function(req, res) {
  var token = req.params.token;
  db.get('gabiko:token:'+token, function(err, hash) {
    if(err) throw err;
    if(!hash) {
      return res.status(404).send('Not Found\n');
    }
    var next = utils.nextEvent();
    var nextkey = strftime('%Y%m%d', next);

    var key = 'gabiko:'+nextkey+':'+hash;
    db.hgetall(key, function(err, info) {
      if(err) throw err;

      //console.log('response from', info);

      var incr = 0;
      var newState = undefined;
      for(var mode in utils.modes) {
        if(info.state == mode ) {
          incr -= utils.modes[mode];
        }
        if(token == info[mode]) {
          incr += utils.modes[mode];
          newState = mode;
        }
      }

      info['newState'] = newState; // for the notifier.

      db.multi()
        .hmset(key,
          'time', (new Date()).getTime(),
          'state', newState)
        .incrby('gabiko:'+nextkey, incr)
        .exec(function(err, results) {
          if(err) throw err;
          var count = results[1];

          if(typeof config.notifier == 'function') {
            process.nextTick(function() {
              try {
                config.notifier( info, count );
              } catch(e) {
                console.error(e);
              }
            });
          }

          //console.log(results);
          res.status(200).send((count*.1)+'\n');
        });

    });

  });
});
app.set('port', process.env.PORT || config.port || 3000);
app.listen(app.get('port' ),function() {
  if(app.cron !== undefined) {
    clearInterval( app.cron );
  }
  cron.iterate(db);
  app.cron = setInterval(function() {
    cron.iterate(db);
  }, config.cronInterval);
});