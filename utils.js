
exports.modes = {
  ackknowledge: 10,
  reject: 0,
  maybe: 5,
  plus: 20,
};

exports.nextEvent = function nextEvent( startDate ) {

  var now = startDate === undefined ? new Date() : startDate;
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  //console.log(today);
  while(true) {

    // Is the second saturday of the month?
    if( today.getDay() == 6 && today.getDate() > 7 && today.getDate() < 15 ) {
      // yes.
      return today;
    }

    today = new Date(today.getTime() + 86400000); // plus one day

  }

  return undefined; // yes, when hell freezes over..
};
