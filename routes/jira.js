var express = require('express');
var router = express.Router();
const slackService = require('../service/slackService');
const jiraService = require('../service/jiraService');
const jiraConfig = jiraService.jiraConfig;

const webhookMsgController = function (data, webhookId, cb) {
  const jiraTracker = jiraConfig.jiraTracker;
  for (let i = 0, len = jiraTracker.length; i < len; i++) {
    if (jiraTracker[i].webhookId == webhookId) {
      webhookMsgCreator(data, (msg) => {
        let message = Object.assign({channel: jiraTracker[i].sender.channel}, msg);
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
  // changelog -> {items: [{field, fieldtype, from, fromString, to, toString}]}
  let changelog = data.changelog;
  let statusString;

  console.log('changelog:', changelog);
  if (changelog.items === undefined) {
    return cb(null);
  }

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

  if (statusString === undefined) {
    return cb(null);
  }
  
  console.log(eventType, statusString);
  issue['statusString'] = statusString;
  issue['issueLink'] = `${jiraService.jiraConfig.httpHost}/browse/${issue.key}`;

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

module.exports = router;
