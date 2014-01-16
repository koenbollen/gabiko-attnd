
var model = module.exports = function model( redis ) {
  this.redis = redis;
};

model.prototype.participants = function participants( callback ) {

  this.redis.multi()
    .smembers('gabiko:participants')
    .hgetall('gabiko:codenames')
    .exec(function(err, results) {
      if(err) return callback(err);
      var participants = results[0];
      var codenames = results[1];

      var resultset = [];
      participants.forEach(function(participant) {
        resultset.push({
          mail: participant,
          codename: codenames[participant],
        });
      });

      callback(undefined, resultset);
    });

};
