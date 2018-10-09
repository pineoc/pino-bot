const assert = require('assert');
const sinon = require('sinon');

describe('All function call test', function(){
  describe('Function call test', function(){
    it('Should invoke the callback', function(){
      const spy = sinon.spy();
      const slackService = require('../service/slackService');

      // slack service function test
      slackService.makeAttachment({}, spy);
      assert.equal(spy.called, true);
    });
  });
});
