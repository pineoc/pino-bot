var express = require('express');
var router = express.Router();
const slackService = require('./slackService');
const jiraService = require('./jiraService');
const jiraConfig = jiraService.jiraConfig;

/* GET users listing. */
router.get('/', function (req, res) {
  res.send('respond with a resource');
});

const webhookMsgCont = function (data, webhookId, cb) {
  const jiraTracker = jiraConfig.jiraTracker;
  for (let i = 0, len = jiraTracker.length; i < len; i++) {
    if (jiraTracker[i].webhookId == webhookId) {
      webhookMsgCreator(data, (msg) => {
        let message = Object.assign({
          channel: jiraTracker[i].sender.channel}, msg);
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

  let msg = {
    attachments: [
      {
        'author_name': issue.fields.issuetype.name,
        'title': `[${issue.key}] ${issue.fields.summary}`,
        'title_link': `${jiraService.jiraConfig.httpHost}/browse/${issue.key}`,
        'fields': [
          {
            'title': 'Status',
            'value': statusString,
            'short': false
          }, {
            'title': 'Assignee',
            'value': issue.fields.assignee.displayName,
            'short': true
          }, {
            'title': 'Reporter',
            'value': issue.fields.reporter.displayName,
            'short': true
          }
        ],
        'footer': 'JIRA tracker'
      }
    ]
  };
  cb(msg);
};

router.post('/webhook', (req, res) => {
  const reqBody = req.body;
  const webhookId = req.query['wh-id'];
  
  webhookMsgCont(reqBody, webhookId, (result) => {
    slackService.sendMessage(result, () => {
      res.send(true);
    });
  });
});

module.exports = router;
