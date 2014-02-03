
var fs = require('fs');
var crypto = require('crypto');

var jade = require('jade');
var strftime = require('strftime');
var base58 = require('base58-native');

var utils = require('./utils');
var mail = require('./mail');

function generateId(bytes) {
  return base58.encode(crypto.pseudoRandomBytes(bytes ? bytes : 16));
}

exports.iterate = function iterate(db) {

  var config = require('./config');

  var now = new Date();
  var next = utils.nextEvent(now);

  if( now > new Date(next.getTime() - config.inviteDelta ) ) {

    var nextkey = strftime('%Y%m%d', next);

    var renderer = jade.compile( fs.readFileSync(config.template) );

    config.people.map(function(person) {

      person['hash'] = crypto.Hash('sha1');
      person['hash'].update( person.mail );
      person['hash'] = person['hash'].digest('hex');
      person['target'] = next;
      person['targetStr'] = strftime("%Y-%m-%d", next);

      person['key'] = 'gabiko:'+nextkey+':'+person.hash;

      db.exists(person.key, function(err, result) {
        if(err) throw err;
        if(!result) {

          var tokens = {
            ackknowledge: generateId(config.tokenLength),
            reject: generateId(config.tokenLength),
            maybe: generateId(config.tokenLength),
            plus: generateId(config.tokenLength)
          };

          person['tokens'] = tokens;
          person['image_token'] = generateId(config.tokenLength*.5);

          var expire = config.inviteDelta * 2 / 1000; // expire in two weeks (was in ms, need sec)

          db.multi()
            .hmset(person.key,
              'invited', now.getTime(),
              'name', person.name,
              'email', person.mail,
              'state', 'invited',
              'time', now.getTime(),
              'image_token', person['image_token'],
              'image_time', 0,
              'ackknowledge', tokens.ackknowledge,
              'reject', tokens.reject,
              'maybe', tokens.maybe,
              'plus', tokens.plus)
            .expire(person.key, expire)
            .setex('gabiko:token:'+tokens.ackknowledge, expire, person.hash)
            .setex('gabiko:token:'+tokens.reject, expire, person.hash)
            .setex('gabiko:token:'+tokens.maybe, expire, person.hash)
            .setex('gabiko:token:'+tokens.plus, expire, person.hash)
            .setex('gabiko:image:'+person['image_token'], expire, person.hash)
            .exec(function(err, results) {
              mail.send_invite(person, renderer, function(err, result) {
                if(err) {
                  console.error(err, person);
                  db.del(person.key, console.error);
                } else {
                  console.log( 'sent', person.mail );
                }
              });
            });
        }
      });

    });

  }

};
