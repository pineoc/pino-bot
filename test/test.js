const assert = require('assert');
const sinon = require('sinon');
const EventEmitter = require('events').EventEmitter;

describe('EventEmitter', function(){
  describe('#emit()', function(){
    it('should invoke the callback', function(){
      var spy = sinon.spy()
        , emitter = new EventEmitter();

      emitter.on('foo', spy);
      emitter.emit('foo');
      assert.equal(spy.called, true);
    });

    it('should pass arguments to the callbacks', function(){
      var spy = sinon.spy()
        , emitter = new EventEmitter();

      emitter.on('foo', spy);
      emitter.emit('foo', 'bar', 'baz');
      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(spy, 'bar', 'baz');
    });
  });
});
