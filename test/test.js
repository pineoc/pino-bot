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
  describe('checkText() Test', function () {
    it('Should not get jira ticket on special URLs', function () {
      slackService.checkTextForJiraTicket(`https://link.sharepoint.com/sites/aaa/_layouts/OneNote.aspx?id=%2Fsites%2FShared%20Documents%2Faaa_2018%2Faaa_2018&wd=target7CF9ECF84E-7C50-4816-8D6C-611FCC564668%2F4.8.3.2%7C975C8F9C-EA7E-4EF5-8F4E-36FF57FFCA0C%2F%29
      onenote:https://link.sharepoint.com/sites/aaa/Shared%20Documents/aaa_2018/aaa_2018/1.a/a.one#4.8.3.2&section-id={F9ECF84E-7C50-4816-8D6C-611FCC564668}&page-id={975C8F9C-EA7E-4EF5-8F4E-36FF57FFCA0C}&end`, (res) => {
          assert.equal(res, null);
        });
    });
  });
});

describe('jiraService module test', function () {
  describe('getIssueByKey() test', function () {
    it('Should get JIRA issue data fields not null', function (done) {
      jiraService.getIssueByKey('BRO-1234', function (res) {
        assert.notEqual(res.fields, null);
        done();
      });
    });
    it('Should not get JIRA issue data. fields undefined', function (done) {
      jiraService.getIssueByKey('BRO1-1234', function (res) {
        assert.equal(res.fields, undefined);
        done();
      });
    });
  });
  describe('getIssueByKeyFiltered() test', function () {
    it('Should get JIRA issue key is same', function (done) {
      jiraService.getIssueByKeyFiltered('BRO-1234', function (res) {
        assert.equal(res.key, 'BRO-1234');
        done();
      });
    });
    it('Should not get JIRA issue. key undefined', function (done) {
      jiraService.getIssueByKeyFiltered('BRO1-1234', function (res) {
        assert.equal(res.key, undefined);
        done();
      });
    });
    it('Should get JIRA issue data fields fix Version', function (done) {
      jiraService.getIssueByKeyFiltered('BRO-11234', function (res) {
        assert.notEqual(res.fixVersion, null);
        done();
      });
    });
  });
});
