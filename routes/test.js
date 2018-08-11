var express = require('express');
var router = express.Router();
const { WebClient } = require('@slack/client');
const slackConfig = require('../conf/slack.json');
const jiraConfig = require('../conf/jira.json');
const jiraService = require('./jiraService');

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = slackConfig.slackToken;
const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = slackConfig.testChannelID;

router.get('/hello', function (req, res, next) {
  // See: https://api.slack.com/methods/chat.postMessage
  web.chat.postMessage({ channel: conversationId, text: 'Hello there' })
    .then((res) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
      res.send(res);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});

router.get('/attachment', (req, res, next) => {
  const msg = {
    channel: conversationId,
    text: 'Hello there',
    attachments: [
      {
        "text": "And here’s an attachment!",
        "color": "#2eb886"
      }, {
        "fallback": "Required plain-text summary of the attachment.",
        "color": "danger",
        "pretext": "Optional text that appears above the attachment block",
        "author_link": "http://flickr.com/bobby/",
        "title": "Slack API Documentation",
        "title_link": "https://api.slack.com/",
        "text": "Optional text that appears within the attachment",
        "fields": [
          {
            "title": "Priority",
            "value": "Major",
            "short": true
          }, {
            "title": "Name",
            "value": "High",
            "short": true
          }, {
            "title": "reproduce",
            "value": "1~10%",
            "short": false
          }
        ],
        "image_url": "http://my-website.com/path/to/image.jpg",
        "thumb_url": "https://platform.slack-edge.com/img/default_application_icon.png",
        "footer": "Slack API",
        "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
        "ts": Date.now()
      }
    ]
  };

  web.chat.postMessage(msg)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});

router.get('/jira-get-issue/:issueKey', (req, res, next) => {
  const issueKey = req.params.issueKey;

  jiraService.getIssueByKey(issueKey, (data) => {
    // console.log(data);
    // console.log(data.fields.issuetype.iconUrl);
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
      fixVersion: data.fields.fixVersions,
      created: data.fields.created,
      creator: data.fields.creator.displayName,
      reporter: data.fields.reporter.displayName,
      assignee: data.fields.assignee,
    };
    res.json(issueData);
  });
});

router.get('/jira-issue-slack/:issueKey', (req, res, next) => {
  const issueKey = req.params.issueKey;
  jiraService.getIssueByKey(issueKey, (data) => {
    // data parsing
    let issueData = {
      key: data.key,
      project: data.fields.project,
      issueLink: `${jiraConfig.httpHost}/browse/${issueKey}`,
      issueTypeName: data.fields.issuetype.name,
      issueTypeObj: data.fields.issuetype,
      summary: data.fields.summary,
      description: data.fields.description,
      priority: data.fields.priority.name,
      Severity: data.fields.customfield_10503,
      status: data.fields.status.name,
      fixVersion: data.fields.fixVersions,
      created: data.fields.created,
      creator: data.fields.creator.displayName,
      reporter: data.fields.reporter.displayName,
      assignee: data.fields.assignee
    };
    const msg = {
      channel: conversationId,
      attachments: [
        {
          "author_name": issueData.issueTypeName,
          "fallback": `[${issueData.key}] ${issueData.summary}`,
          "color": jiraConfig.ticketColors[issueData.issueTypeName],
          "title": `[${issueData.key}] ${issueData.summary}`,
          "title_link": issueData.issueLink,
          "fields": [
            {
              "title": "Priority",
              "value": issueData.priority,
              "short": true
            }, {
              "title": "Status",
              "value": issueData.status,
              "short": true
            }, {
              "title": "Assignee",
              "value": issueData.assignee.displayName,
              "short": true
            }, {
              "title": "Reporter",
              "value": issueData.reporter,
              "short": true
            }, {
              "title": "Created",
              "value": issueData.created,
              "short": false
            }
          ],
          "footer": "JIRA & SLACK"
        }
      ]
    };
    web.chat.postMessage(msg)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.error(err);
        res.send(err);
      });
  });
});

module.exports = router;