var assert = require('assert');
var slackService = require('../routes/slackService');
var jiraService = require('../routes/jiraService');

describe('slackService module test', function () {
  describe('checkText() success test', function () {
    const testText = 'Hello! PRO-1234, PRO-1235 PRO-9999';
    let parsedText;
    before(function () {
      slackService.checkTextForJiraTicket(testText, (res) => {
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
      slackService.checkTextForJiraTicket('Good! PRO-1111', (res) => {
        assert.equal(res.length, 1);
        assert.equal(res[0], 'PRO-1111');
      });
    });
    it('Should get jira ticket on URL', function () {
      slackService.checkTextForJiraTicket('Good! https://example.com/browse/PRO-11296 PRO-1111', (res) => {
        assert.equal(res.length, 2);
        assert.equal(res[0], 'PRO-11296');
      });
    });
  });
});

describe('jiraService module test', function () {
  describe('getIssueByKey() test', function () {
    it('Should get JIRA issue data fields not null', function () {
      jiraService.getIssueByKey('BRO-1234', function (res) {
        assert.notEqual(res.fields, null);
      });
    });
    it('Should get JIRA issue data fields undefined', function () {
      jiraService.getIssueByKey('BRO1-1234', function (res) {
        assert.equal(res.fields, undefined);
      });
    });
  });
  describe('getIssueByKeyFiltered() test', function () {
    it('Should get JIRA issue key not null', function () {
      jiraService.getIssueByKeyFiltered('BRO-1234', function (res) {
        assert.notEqual(res.key, null);
      });
    });
    it('Should get JIRA issue key undefined', function () {
      jiraService.getIssueByKeyFiltered('BRO1-1234', function (res) {
        assert.equal(res.key, undefined);
      });
    });
    it('Should get JIRA issue data fields fix Version', function () {
      jiraService.getIssueByKeyFiltered('BRO-11234', function (res) {
        assert.notEqual(res.fixVersion, null);
      });
    });
  });
});
