var assert = require('assert');
var slackService = require('../routes/slackService');

// test sample
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});

describe('slackService module test', function () {
  describe('checkText() success test', function () {
    const testText = 'Hello! PRO-1234, PRO-1235 PRO-9999';
    let parsedText;
    before(function () {
      slackService.checkText(testText, (res) => {
        parsedText = res;
      });
    });
    it('Should get jira 3 tickets on text', function () {
      assert.equal(parsedText.length, 3);
    });
    it('Should get jira ticket be in order. first key === PRO-1234', function () {
      assert.equal(parsedText[0], 'PRO-1234');
    });
    it('Should get jira ticket 1 array', function () {
      slackService.checkText('Good! PRO-1111', (res) => {
        assert.equal(res.length, 1);
        assert.equal(res[0], 'PRO-1111');
      });
    });
  });
});