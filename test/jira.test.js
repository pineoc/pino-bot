const assert = require('assert');
// const sinon = require('sinon');
const jiraService = require('../service/jiraService');
const jiraConf = jiraService.jiraConfig;

describe('jiraService get info test', function () {
  describe('getIssueByKey() test', function () {
    it('Should get JIRA issue data fields not null', function (done) {
      jiraService.getIssueByKey(`${jiraConf.testProjectKey}-13`, function (err, res) {
        assert.notEqual(res.fields, null);
        done();
      });
    });
    it('Should not get JIRA issue data. fields undefined', function (done) {
      jiraService.getIssueByKey(`${jiraConf.testProjectKey}1-13`, function (err, res) {
        assert.notEqual(err, null);
        assert.equal(res, null);
        done();
      });
    });
  });
  describe('getIssueByKeyFiltered() test', function () {
    it('Should get JIRA issue key is same', function (done) {
      const key = `${jiraConf.testProjectKey}-12`;
      jiraService.getIssueByKeyFiltered(key, function (res) {
        assert.equal(res.key, key);
        done();
      });
    });
    it('Should not get JIRA issue. key undefined', function (done) {
      jiraService.getIssueByKeyFiltered(`${jiraConf.testProjectKey}1-12`, function (res) {
        assert.notEqual(res.errorMessages, null);
        assert.equal(res.key, undefined);
        done();
      });
    });
    it('Should get JIRA issue data fields fix Version', function (done) {
      jiraService.getIssueByKeyFiltered(`${jiraConf.testProjectKey}-13`, function (res) {
        assert.notEqual(res.fixVersion, null);
        done();
      });
    });
  });
});

describe('jiraService transition test', function () {
  describe('issue getTransition test', function () {
    it('Should get transition data not null', function (done) {
      jiraService.getTransitions(jiraConf.testProjectTicket, function (res) {
        assert.equal(res.errorMessages, undefined);
        assert.notEqual(res, null);
        done();
      });
    });

    it('Error get transition data', function (done) {
      jiraService.getTransitions(`${jiraConf.testProjectKey}1-13`, function (res) {
        assert.notEqual(res.errorMessages, null);
        done();
      });
    });
  });
  describe('issue doTransition test', function () {
    const issueKey = jiraConf.testProjectTicket;
    let transitions;
    this.beforeEach(function (done) {
      jiraService.getTransitions(issueKey, function (res) {
        transitions = res;
        done();
      });
    });
    it('Should transition work', function (done) {
      assert.notEqual(transitions, null);
      jiraService.doTransitionIssue(issueKey, transitions[0].tId, function (err, res) {
        assert.equal(err, null);
        assert.notEqual(res, null);
        done();
      });
    });
    it('Error, transition not work on invalid transition id', function (done) {
      jiraService.doTransitionIssue(issueKey, -1, function (err, res) {
        assert.notEqual(err, null);
        assert.equal(res, null);
        done();
      });
    });
  });
});

describe('JIRA 상태를 알 수 있어야한다.', function () {
  describe('JIRA 서비스에 status 상태 값을 받아올 수 있다.', function () {
    let statusResult;
    before('status result init', function (done) {
      jiraService.getJiraStatus(function (err, res) {
        statusResult = res;
        done();
      });
    });
    it('요청에 대한 response 값이 json 형태로 존재해야한다.', function () {
      assert.equal(typeof statusResult, 'object');
    });
    it('요청에 대한 응답에 state가 존재해야 한다.', function () {
      assert.notEqual(statusResult, null);
      assert.notEqual(statusResult.state, null);
    });
  });
});