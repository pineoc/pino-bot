const assert = require('assert');
const utilService = require('../service/utilService');

describe('Util function call test', function () {
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
});
