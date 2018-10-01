const slackConfig = require('../conf/slack.json');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/client');
const slackEvents = createEventAdapter(slackConfig.signingSecret);

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = slackConfig.slackToken;
const web = new WebClient(token);

const checkTextForJiraTicket = function (text, cb) {
  // Ref: https://community.atlassian.com/t5/Bitbucket-questions/Regex-pattern-to-match-JIRA-issue-key/qaq-p/233319
  // const jiraMatcherLegacy = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;
  const jiraMatcher = /((?<!([A-Za-z]{1,10})-?)[A-Z]+-\d+)/g;
  let t = text.match(jiraMatcher);
  if (text.includes('onenote:')) {
    return cb(null);
  }
  if (t != null && t.length > 0) {
    // jira ticket string in text
    return cb(t);
  }
};
// exports functions, config
module.exports.checkTextForJiraTicket = checkTextForJiraTicket;
module.exports.slackEvents = slackEvents;
module.exports.slackConfig = slackConfig;

// send Message to slack channel
const sendMessage = function (msgObj, cb) {
  // See: https://api.slack.com/methods/chat.postMessage
  web.chat.postMessage(msgObj)
    .then((result) => {
      if(cb) cb(result);
    })
    .catch((err) => {
      if(cb) cb(err);
    });
};
module.exports.sendMessage = sendMessage;

const makeAttachment = function (data, cb) {
  let attachment;
  if (data.errorMessages) {
    attachment = {'title': 'Issue Does Not Exist', 'color': '#000000'};
    return cb(attachment);
  }
  attachment = {
    'author_name': data.issueTypeName,
    'fallback': `[${data.key}] ${data.summary}`,
    'color': data.issueColor,
    'title': `[${data.key}] ${data.summary}`,
    'title_link': data.issueLink,
    'fields': [
      {
        'title': 'Priority',
        'value': data.priority,
        'short': true
      }, {
        'title': 'Status',
        'value': data.status,
        'short': true
      }, {
        'title': 'Assignee',
        'value': data.assignee,
        'short': true
      }, {
        'title': 'Reporter',
        'value': data.reporter,
        'short': true
      }, {
        'title': 'Fix Version',
        'value': data.fixVersion.join(),
        'short': false
      }
    ],
    'footer': 'JIRA & SLACK'
  };
  cb(attachment);
};
module.exports.makeAttachment = makeAttachment;