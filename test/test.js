const assert = require('assert');
const sinon = require('sinon');

describe('system modules install check', function() {
  describe('check requires', function() {
    it('[check] lowdb', function() {
      const lowdb = require('lowdb');
      assert.notEqual(lowdb, undefined);
    });
    it('[check] moment-timezone', function() {
      const mt = require('moment-timezone');
      assert.notEqual(mt, undefined);
    });
    it('[check] node-cron', function() {
      const nc = require('node-cron');
      assert.notEqual(nc, undefined);
    });
    it('[check] jira-connector', function() {
      const jc = require('jira-connector');
      assert.notEqual(jc, undefined);
    });
    it('[check] @slack/client', function() {
      const sc = require('@slack/client');
      assert.notEqual(sc, undefined);
    });
    it('[check] @slack/events-api', function() {
      const se = require('@slack/events-api');
      assert.notEqual(se, undefined);
    });
    it('[check] svn-spawn', function() {
      const svn = require('svn-spawn');
      assert.notEqual(svn, undefined);
    });
  });
});

describe('All function call test', function() {
  describe('Function call test', function() {
    it('Should invoke the callback', function() {
      const spy = sinon.spy();
      const slackService = require('../service/slackService');

      // slack service function test
      slackService.makeAttachment({}, spy);
      assert.equal(spy.called, true);
    });
  });
});
