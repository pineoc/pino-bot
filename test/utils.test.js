const assert = require('assert');
const utilService = require('../service/utilService');

describe('Util function call test', function () {
  describe('util time test', function () {
    it('time string not null', function () {
      utilService.getTimes((res) => {
        assert.notEqual(res, null);
      });
    });
  });
});
