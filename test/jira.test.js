const assert = require('assert');
// const sinon = require('sinon');
// const EventEmitter = require('events').EventEmitter;
const jiraService = require('../service/jiraService');

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