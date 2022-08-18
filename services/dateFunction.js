function getWeekNumber() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff =
    now -
    start +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return Math.floor(day / 7);
}

function getDate() {
  var now = new Date();
  var date = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
  return date;
}

function getPreviousDate() {
  var now = new Date(Date.now() - 864e5);
  var date = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
  return date;
}


// const date = new Date();
// console.log(date);
// const offset = date.getTimezoneOffset();
// console.log(offset);    // -300

// const hours = date.getHours()

// console.log(hours);

// const minutes = date.getMinutes()

// console.log(minutes);

// const newDate = new Date('')


// const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// console.log(timezone); // Asia/Karachi

module.exports = { getWeekNumber, getDate, getPreviousDate };
