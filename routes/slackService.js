const slackConfig = require('../conf/slack.json');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/client');
const slackEvents = createEventAdapter(slackConfig.signingSecret);

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = slackConfig.slackToken;
const web = new WebClient(token);

const checkText = function (text, cb) {
  // Ref: https://community.atlassian.com/t5/Bitbucket-questions/Regex-pattern-to-match-JIRA-issue-key/qaq-p/233319
  const jiraMatcher = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;
  let t = text.match(jiraMatcher);
  if (t != null && t.length > 0) {
    // jira ticket string in text
    cb(t);
  }
  if (text === '안녕') {
    // test text
    cb('test');
  }
};
// export for test
module.exports.checkText = checkText;
module.exports.slackEvents = slackEvents;

// send Message to slack channel
const sendMessage = function (messageObj, cb) {
  // See: https://api.slack.com/methods/chat.postMessage
  web.chat.postMessage(messageObj)
    .then((result) => {
      // `res` contains information about the posted message
      cb(result);
    })
    .catch((err) => {
      console.error(err);
      cb(err);
    });
};
module.exports.sendMessage = sendMessage;

const makeAttachment = function (data, cb) {
  const attachment = {
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
        'value': data.assignee.displayName,
        'short': true
      }, {
        'title': 'Reporter',
        'value': data.reporter,
        'short': true
      }, {
        'title': 'Created',
        'value': data.created,
        'short': false
      }
    ],
    'footer': 'JIRA & SLACK'
  };
  cb(attachment);
};
module.exports.makeAttachment = makeAttachment;