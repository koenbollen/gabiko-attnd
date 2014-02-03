var config = module.exports = {


  // Must override in localconfig.js, mail will link here.
  baseurl: 'http://localhost:3000',


  // Must override in localconfig.js, domain must resolv..
  from: 'The Gabiko Initiative <initiative@localhost',


  // Must override in localconfig.js, add people to list.
  people: [
    {
      name: 'Kaji Test',
      mail: 'test@koenbollen.nl',
    },
    /*/
    {
      name: 'Jeffery',
      mail: 'jeffery@koenbollen.nl',
    },
    //*/
  ],


  // Should override in localconfig.js, use gmail.
  mail_transport: function(nodemailer) {
    return nodemailer.createTransport("direct", {debug: true});
  },


  cronInterval: 300 * 1000, // 5 mins

  tokenLength: 16, // bytes

  inviteDelta: 3600 * 24 * 7 * 1000, //ms

  template: 'views/invite.jade',

  // Callback when a user changes his attendance (may error).
  notifier: function( info, count ) {
    console.log(info.name, 'changed to', info.newState, 'making', count);
  },
};



var local = undefined;
try {
  local = require('./localconfig.js');
} catch(e) {
  console.error('failed to load localconfig:', e);
}
if(local!==undefined) {
  for(var k in local) {
    config[k] = local[k];
  }
}
