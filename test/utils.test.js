const assert = require('assert');
const utilService = require('../service/utilService');
const svnService = require('../service/svnService');
const moment = require('moment-timezone');

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
      const dateFormat = 'YYYY.M.D, h:mma z';
      const time1Value = moment().tz('UTC').format(dateFormat);
      const time1 = utilService.getTimeBySearch('utc');
      assert.notEqual(time1, null);
      assert.equal(time1.country, 'earth_asia');
      assert.equal(time1.time, time1Value);

      const time2Value = moment().tz('America/New_York').format(dateFormat);
      const time2 = utilService.getTimeBySearch('ny');
      assert.equal(time2.country, 'us');
      assert.equal(time2.time, time2Value);

      const time3 = utilService.getTimeBySearch('뉴욕');
      assert.equal(time3.country, 'us');
      assert.equal(time3.time, time2Value);
    });
    it('timezone search return no data', function () {
      const time = utilService.getTimeBySearch('111');
      const noDataFormat = {time: 'invalid country code', country: 'question'};
      assert.deepEqual(time, noDataFormat);
    });
  });
});

describe('svn function call test', function() {
  describe('svn getLog test', function () {
    it('svn getLog not null', function (done) {
      svnService.getSvnLog(1, (err, result) => {
        assert.notEqual(result, undefined);
        done();
      });
    });
    it('svn getLog not null', function (done) {
      svnService.getSvnLog(7, (err, result) => {
        assert.notEqual(result, undefined);
        done();
      });
    });
    it('svn getLog not null', function (done) {
      svnService.getSvnLog(8, (err, result) => {
        assert.notEqual(result, undefined);
        done();
      });
    });
    it('svn getLog error on negative number', function (done) {
      svnService.getSvnLog(-1, (err, result) => {
        assert.notEqual(err, null);
        assert.equal(Object.keys(result).length, 0);
        done();
      });
    });
    it('svn getLog error on large number', function (done) {
      svnService.getSvnLog(999999, (err, result) => {
        assert.notEqual(err, null);
        assert.equal(Object.keys(result).length, 0);
        done();
      });
    });
  });
  describe('svn get HEAD log', function () {
    it('svn getHeadLog not null', function (done) {
      svnService.getSvnHeadRevision(function (err, result) {
        assert.notEqual(result, null);
        done();
      });
    });
  });
});