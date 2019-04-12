var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const slackService = require('../service/slackService');
const jiraService = require('../service/jiraService');
const jiraConfig = jiraService.jiraConfig;
const dbService = require('../service/db');

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = slackService.slackConfig.testChannelID;

router.get('/', (req, res) => {
  res.send('hello test');
});

router.get('/hello', (req, res) => {
  slackService.sendMessage({channel: conversationId, text: 'Hello there'}, (result) => {
    res.send(result);
  });
});

router.post('/send-text', (req, res) => {
  slackService.sendMessage({channel: conversationId, text: req.body.text}, result => {
    res.send(result);
  });
});

router.get('/attachment', (req, res) => {
  const msgObj = {
    channel: conversationId,
    text: 'Hello there',
    attachments: [
      {
        'text': 'And here’s an attachment!',
        'color': '#2eb886'
      }, {
        'fallback': 'Required plain-text summary of the attachment.',
        'color': 'danger',
        'pretext': 'Optional text that appears above the attachment block',
        'author_link': 'http://flickr.com/bobby/',
        'title': 'Slack API Documentation',
        'title_link': 'https://api.slack.com/',
        'text': 'Optional text that appears within the attachment',
        'fields': [
          {
            'title': 'Priority',
            'value': 'Major',
            'short': true
          }, {
            'title': 'Name',
            'value': 'High',
            'short': true
          }, {
            'title': 'reproduce',
            'value': '1~10%',
            'short': false
          }
        ],
        'image_url': 'http://my-website.com/path/to/image.jpg',
        'thumb_url': 'https://platform.slack-edge.com/img/default_application_icon.png',
        'footer': 'Slack API',
        'footer_icon': 'https://platform.slack-edge.com/img/default_application_icon.png',
        'ts': Date.now()
      }
    ]
  };

  slackService.sendMessage(msgObj, (result) => {
    res.send(result);
  });
});

router.get('/jira-get-issue/:issueKey', (req, res, next) => {
  const issueKey = req.params.issueKey;

  jiraService.getIssueByKey(issueKey, (err, data) => {
    if (err) {
      next(createError(500));
      return;
    }
    var issueData = {
      key: data.key,
      project: data.fields.project,
      issueLink: `${jiraConfig.httpHost}/browse/${issueKey}`,
      issueType: data.fields.issuetype.name,
      summary: data.fields.summary,
      description: data.fields.description,
      priority: data.fields.priority.name,
      Severity: data.fields.customfield_10503,
      status: data.fields.status.name,
      fixVersion: data.fields.fixVersions.map(v => v.name).join(),
      created: data.fields.created,
      creator: data.fields.creator.displayName,
      reporter: data.fields.reporter.displayName,
      assignee: data.fields.assignee,
    };
    res.json(issueData);
  });
});

router.get('/jira-get-issue-f/:issueKey', (req, res, next) => {
  const issueKey = req.params.issueKey;

  jiraService.getIssueByKeyFiltered(issueKey, (data) => {
    if (data.errorMessages) {
      next(createError(500));
      return;
    }
    slackService.makeAttachment(data, (attData) => {
      res.json(attData);
    });
  });
});

router.get('/jira-issue-slack/:issueKey', (req, res) => {
  const issueKey = req.params.issueKey;
  jiraService.getIssueByKeyFiltered(issueKey, (data) => {
    const msgObj = {
      channel: conversationId,
      attachments: [
        {
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
        }
      ]
    };
    slackService.sendMessage(msgObj, (result) => {
      res.send(result);
    });
  });
});

router.get('/jira-transition/:issueKey', (req, res) => {
  const issueKey = req.params.issueKey;
  jiraService.getTransitions(issueKey, (data) => {
    res.json(data);
  });
});

router.get('/jira-do-transition/:issueKey', (req, res) => {
  const issueKey = req.params.issueKey;
  const query = req.query;
  jiraService.doTransitionIssue(issueKey, query.t, (err, result) => {
    res.json({error: err, result: result});
  });
});

router.get('/db-test', (req, res) => {
  dbService.getJiraInfoChannels(data => {
    res.json(data);
  });
});
router.get('/db-state', (req, res) => {
  dbService.getDBState(data => {
    res.json(data);
  });
});
router.get('/db-set-test', (req, res) => {
  dbService.setJiraInfo(req.query, (data) => {
    res.json(data);
  });
});
router.get('/webhook', (req, res) => {
  const query = req.query;
  let msgObj = {};
  // crowdin event
  if (query.event) {
    msgObj = {
      channel: 'CHBGL3F29',
      attachments: [
        {
          'color': 'good',
          'title': `[Crowdin] ${query.event}`,
          'title_link': `https://crowdin.com/project/${query.project}`,
          'fields': [
            {
              'title': 'language',
              'value': query.language,
              'short': true
            }
          ]
        }
      ]
    };
  }
  slackService.sendMessage(msgObj, (result) => {
    res.json(result);
  });
});
router.post('/webhook', (req, res) => {
  const body = req.body;
  let msgObj = {};
  msgObj = {
    channel: 'CHSM55U93',
    text: '[TEST]' + JSON.stringify(body)
  };
  slackService.sendMessage(msgObj, (result) => {
    res.json(result);
  });
});

module.exports = router;