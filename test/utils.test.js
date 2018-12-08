const assert = require('assert');
const utilService = require('../service/utilService');

describe('Util time function call test', function () {
  describe('util time test', function () {
    it('time string not null', function () {
      assert.notEqual(utilService.getTime(), null);
    });
    it('get all time work', function () {
      const times = utilService.getAllTime();
      assert.notEqual(times, null);
      assert.equal(times.length, 7);
      assert.equal(times[0].country, 'earth_asia');
      assert.notEqual(times[0].time, times[1].time);
    });
  });
  describe('util time search test', function () {
    it('timezone search can work', function () {
      const time1 = utilService.getTimeBySearch('utc');
      assert.notEqual(time1, null);
      assert.equal(time1.country, 'earth_asia');
      assert.notEqual(time1.time, null);

      const time2 = utilService.getTimeBySearch('ny');
      assert.equal(time2.country, 'us');
      assert.notEqual(time2.time, null);

      const time3 = utilService.getTimeBySearch('뉴욕');
      assert.equal(time3.country, 'us');
      assert.notEqual(time3.time, null);
    });
    it('timezone search return undefined on no data', function () {
      const time = utilService.getTimeBySearch('111');
      assert.equal(time, null);
    });
  });
});
