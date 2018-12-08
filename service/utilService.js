const moment = require('moment-timezone');
const timezones = [
  {tz: 'UTC', country: 'earth_asia', name: ['utc', 'base']},
  {tz: 'Asia/Seoul', country: 'kr', name: ['korea', 'seoul', '한국', '서울']},
  {tz: 'Asia/Shanghai', country: 'cn', name: ['china', 'shanghai', '중국', '상하이']},
  {tz: 'Asia/Tokyo', country: 'jp', name: ['japan', 'tokyo', '일본', '도쿄']},
  {tz: 'America/New_York', country: 'us', name: ['ny', 'new york', 'newyork', '뉴욕']},
  {tz: 'America/Los_Angeles', country: 'us', name: ['la', 'los angeles', '엘에이', '에레이']},
  {tz: 'Europe/Amsterdam', country: 'nl', name: ['nederland', 'amsterdam', 'ams', '네덜란드', '암스테르담', '암스']}
];
// TODO: add search country time function
const dateFormat = 'YYYY.M.D, h:mma z';
// default timezone: Asia/Seoul
const getTime = function () {
  const time = moment().utc().format(dateFormat);
  const timeObj = {time: time, country: timezones[0].country};
  return timeObj;
};
const getAllTime = function () {
  const defaultTime = moment().tz(timezones[1].tz);
  const times = timezones.map(timezone => {
    const time = defaultTime.clone().tz(timezone.tz).format(dateFormat);
    const timeObj = {time: time, country: timezone.country};
    return timeObj;
  });
  return times;
};
// internal function
const searchTimezone = function (word) {
  // 검색하고자 한 타임존이 없으면 undefined 반환
  const timezone = timezones.find(timezone => {
    const result = timezone.name.findIndex(n => n === word);
    if (result !== -1) {
      return timezone;
    }
  });
  return timezone;
};
const getTimeBySearch = function (word) {
  const timezone = searchTimezone(word);
  if (timezone) {
    const time = moment().tz(timezone.tz).format(dateFormat);
    const timeObj = {time: time, country: timezone.country};
    return timeObj;
  } else {
    return null;
  }
};

const getConchDecision = function () {
  const decision = Math.random() >= 0.5;
  return decision;
};

module.exports = {
  getTime,
  getAllTime,
  getTimeBySearch,
  getConchDecision
};