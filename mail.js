
var nodemailer = require('nodemailer');

var config = require('./config');

function send_invite( info, renderer, callback ) {

  info['baseurl'] = config.baseurl;

  var body = renderer(info);

  //console.log('\n\n------------');
  //console.log(body);
  //console.log('------------\n\n');

  /*/
  callback(undefined, '');
  /*/
  var transport = config.mail_transport(nodemailer);
  transport.sendMail({
    from: config.from,
    to: info.codename + ' <' + info.mail + '>',
    subject: 'Gabiko ⧯ Invite: '+info.targetStr,
    html: body,
    text: 'get a new e-mail client...',
  }, callback);
  //*/

}

exports.send_invite = send_invite;
