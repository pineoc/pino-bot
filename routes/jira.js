var cron = require('node-cron');
var express = require('express');
var router = express.Router();
const utilService = require('../service/utilService');
const slackService = require('../service/slackService');
const jiraService = require('../service/jiraService');
const jiraConfig = jiraService.jiraConfig;

const webhookMsgController = function (data, webhookId, cb) {
  const jiraTracker = jiraConfig.jiraTracker;
  for (let i = 0, len = jiraTracker.length; i < len; i++) {
    if (jiraTracker[i].webhookId == webhookId) {
      webhookMsgCreator(data, (msg) => {
        let messageData = {
          channel: jiraTracker[i].sender.channel
        };
        let message = Object.assign(messageData, msg);
        cb(message);
      });
    }
  }
};
const webhookMsgCreator = function(data, cb) {
  // webhookEvent -> 'jira:issue_created', 'jira:issue_updated'
  let eventType = data.webhookEvent;
  // issue -> {key, fields:{}}
  let issue = data.issue;
  let issueColor = jiraConfig.ticketColors[issue.fields.issuetype.name];
  // changelog -> {items: [{field, fieldtype, from, fromString, to, toString}]}
  let changelog = data.changelog;
  let statusString;

  if (eventType === 'jira:issue_created') {
    statusString = `:new: ${issue.fields.status.name}`;
  }
  if (eventType === 'jira:issue_updated') {
    for (let i = 0, len = changelog.items.length; i < len; i++) {
      if (changelog.items[i].field === 'status') {
        let clStringFrom = changelog.items[i].fromString;
        let clStringTo  = changelog.items[i].toString;
        statusString = `\`${clStringFrom}\` :arrow_right: \`${clStringTo}\``;
      }
    }
  }

  // TODO: fix exceptions catching logic
  if (statusString === undefined) {
    return cb(null);
  }

  issue['statusString'] = statusString;
  issue['issueLink'] = `${jiraService.jiraConfig.httpHost}/browse/${issue.key}`;
  issue['issueColor'] = issueColor;

  slackService.makeChangelogAttachment(issue, (att) => {
    const msg = {
      attachments: [att]
    };
    cb(msg);
  });
};

router.post('/webhook', (req, res) => {
  const reqBody = req.body;
  const webhookId = req.query['wh-id'];
  
  webhookMsgController(reqBody, webhookId, (result) => {
    slackService.sendMessage(result, () => {
      res.send(true);
    });
  });
});

const reportJiraStatus = function () {
  utilService.getJiraStatus(jiraConfig.httpHost, (err, res) => {
    if (err || res.state === 'ERROR' || res.state === 'STOPPING') {
      let msg = {
        channel: slackService.slackConfig.testChannelID,
        attachments: [{
          title: 'JIRA status',
          text: 'JIRA service not working',
          color: 'danger'
        }]
      };
      slackService.sendMessage(msg);
    }
  });
};
// check jira status each 5min
cron.schedule('*/5 * * * *', reportJiraStatus);

module.exports = router;
