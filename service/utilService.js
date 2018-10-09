const moment = require('moment');
const getTimes = function (cb) {
  const time = moment().format();
  cb(time);
};

module.exports = {
  getTimes
};