var express = require('express');
var router = express.Router();
const slackService = require('./slackService');
const jiraService = require('./jiraService');

/* GET users listing. */
router.get('/', function (req, res) {
  res.send('respond with a resource');
});

router.post('/webhook', (req, res) => {
  const reqBody = req.body;

  // for message test logic
  // webhookEvent -> 'jira:issue_created', 'jira:issue_updated'
  let eventType = reqBody.webhookEvent;
  // issue -> {key, fields:{}}
  let issue = reqBody.issue;
  // changelog -> {items: [{field, fieldtype, from, fromString, to, toString}]}
  let changelog = reqBody.changelog;
  let statusString;

  if (eventType === 'jira:issue_created') {
    statusString = `:new: ${issue.fields.status.name}`;
  }
  if (eventType === 'jira:issue_updated') {
    // TODO: Refactoring from, to cases already resolved issues
    let logFrom = changelog.items[0].fromString ? changelog.items[0].fromString : changelog.items[1].fromString;
    let logTo = changelog.items[0].toString ? changelog.items[0].toString : changelog.items[1].toString;
    statusString = `\`${logFrom}\` :arrow_right: \`${logTo}\``;
  }

  let msg = {
    channel: slackService.slackConfig.testChannelID,
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
  slackService.sendMessage(msg);
});

module.exports = router;
