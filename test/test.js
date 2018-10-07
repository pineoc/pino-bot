const assert = require('assert');
const sinon = require('sinon');

describe('EventEmitter test', function(){
  describe('#emit()', function(){
    it('should invoke the callback', function(){
      const spy = sinon.spy();
      const slackService = require('../routes/slackService');

      // slack service function test
      slackService.makeAttachment({}, spy);
      assert.equal(spy.called, true);
    });
  });
});
