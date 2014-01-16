
var redis = require('redis');
var model = require('./model');


var db = redis.createClient();
var model = new model(db);


model.participants( function(err, result) {
  if(err) throw err;

  console.log( result );

  process.exit(0);
});
