var JiraClient = require('jira-connector');
const jiraConfig = require('../conf/jira.json');
var jiraClient = new JiraClient({
  host: jiraConfig.host,
  basic_auth: {
    base64: jiraConfig.basicAuthBase64
  }
});
module.exports.jiraConfig = jiraConfig;

const getIssueByKey = function (issueKey, cb) {
  jiraClient.issue.getIssue({
    issueKey: issueKey
  }, function (err, res) {
    if(err) {
      cb(err);
    } else {
      cb(res);
    }
  });
};
module.exports.getIssueByKey = getIssueByKey;

const getIssueByKeyFiltered = function (issueKey, cb) {
  getIssueByKey(issueKey, (res) => {
    if (res.errorMessages) {
      return cb(res);
    }
    // data filtered
    const fixVersionsName = res.fields.fixVersions.map(v => v.name);
    let filteredData = {
      key: res.key,
      project: res.fields.project,
      issueLink: `${jiraConfig.httpHost}/browse/${issueKey}`,
      issueTypeName: res.fields.issuetype.name,
      issueTypeObj: res.fields.issuetype,
      issueColor: jiraConfig.ticketColors[res.fields.issuetype.name],
      summary: res.fields.summary,
      description: res.fields.description,
      priority: res.fields.priority.name,
      Severity: res.fields.customfield_10503,
      status: res.fields.status.name,
      fixVersion: fixVersionsName.length === 0 ? ['None'] : fixVersionsName,
      created: res.fields.created,
      creator: res.fields.creator.displayName,
      reporter: res.fields.reporter.displayName,
      assignee: res.fields.assignee === null ? 'Unassigned' : res.fields.assignee.displayName
    };
    cb(filteredData);
  });
};
module.exports.getIssueByKeyFiltered = getIssueByKeyFiltered;
