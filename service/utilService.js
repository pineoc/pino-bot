const moment = require('moment-timezone');
const timezones = [
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Amsterdam'
];
const dateFormat = 'YYYY.M.D, h:mma z';
// default timezone: Asia/Seoul
const getTime = function () {
  return moment().tz(timezones[0]).format(dateFormat);
};
const getAllTime = function () {
  const defaultTime = moment().tz(timezones[0]);
  const times = timezones.map(timezone => {
    return defaultTime.clone().tz(timezone).format(dateFormat);
  });
  return times;
};

module.exports = {
  getTime,
  getAllTime
};