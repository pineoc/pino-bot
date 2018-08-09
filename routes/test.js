var express = require('express');
var router = express.Router();
const { WebClient } = require('@slack/client');
const slackConfig = require('../conf/slack.json');

router.get('/hello', function (req, res, next) {
  // An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
  const token = slackConfig.slackToken;
  const web = new WebClient(token);

  // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
  const conversationId = slackConfig.testChannelID;

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
  const token = slackConfig.slackToken;
  const web = new WebClient(token);

  const conversationId = slackConfig.testChannelID;

  const msg = {
    channel: conversationId,
    text: 'Hello there',
    attachments: [
      {
        "text": "And here’s an attachment!",
        "color": "#2eb886"
      },
      {
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
          },
          {
            "title": "Name",
            "value": "High",
            "short": true
          },
          {
            "title": "reproduce",
            "value": "1~10%",
            "short": false
          }
        ],
        "image_url": "http://my-website.com/path/to/image.jpg",
        "thumb_url": "https://platform.slack-edge.com/img/default_application_icon.png",
        "footer": "Slack API",
        "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
        "ts": 123456789
      }
    ]
  };

  web.chat.postMessage(msg)
    .then((res) => {
      res.send(res);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});

module.exports = router;