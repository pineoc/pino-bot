var JiraClient = require('jira-connector');
const jiraConfig = require('../conf/jira.json');
var jiraClient = new JiraClient({
  host: jiraConfig.host,
  basic_auth: {
    base64: jiraConfig.basicAuthBase64
  }
});

module.exports.getIssueByKey = function (issueKey, cb) {
  jiraClient.issue.getIssue({
    issueKey: issueKey
  }, function (err, issue) {
    if(err) {
      cb(err);
    } else {
      cb(issue);
    }
  });
}