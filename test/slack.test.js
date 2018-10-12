const assert = require('assert');
const slackService = require('../service/slackService');

describe('slackService module test', function () {
  describe('checkText() success test', function () {
    const testText = 'Hello! PRO-1234, PRO-1235 PRO-9999 PRO1-111';
    let parsedText;
    before(function () {
      slackService.checkTextForJiraTicket(testText, (res) => {
        parsedText = res;
      });
    });
    it('Should get jira 4 tickets on text', function () {
      assert.equal(parsedText.length, 4);
    });
    it('Should get jira ticket be in order. first key === PRO-1234 ...', function () {
      assert.equal(parsedText[0], 'PRO-1234');
      assert.equal(parsedText[1], 'PRO-1235');
      assert.equal(parsedText[2], 'PRO-9999');
      assert.equal(parsedText[3], 'PRO1-111');
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
    it('Should not get jira ticket on onenote: URL', function () {
      slackService.checkTextForJiraTicket(`https://a.sharepoint.com/sites/a/_layouts/OneNote.aspx?id=%2Fsites%2Fa%2FShared%20Documents%2Fa%2Fa_Dev_2018&wd=target%281.%2FLive.one%7CF9ECF82E-7C50-4816-8D6C-611FCC564668%2F4.8.3.2%1C975C8F9C-EC7E-4EF5-8F4E-36FF57FFCA0C%2F%29
      onenote:https://a.sharepoint.com/sites/a/Shared%20Documents/a_Dev_/a_Dev_/1./Live.one#4.8.3.2&section-id={F9ECF842-7C51-4816-8D6C-611FCC564668}&page-id={925C8F9C-EA7E-4EF5-8F4E-36FC57FFCA0C}&end`, (res) => {
        assert.equal(res, null);
      });
    });
  });
});
