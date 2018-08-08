var express = require('express');
var router = express.Router();
const { WebClient } = require('@slack/client');
const slackConfig = require('../conf/slack.json');

router.get('/test', function (req, res, next) {
  // An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
  const token = slackConfig.slackToken;
  console.log('token: ', token);
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

module.exports = router;