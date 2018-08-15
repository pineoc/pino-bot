const slackConfig = require('../conf/slack.json');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/client');
const slackEvents = createEventAdapter(slackConfig.signingSecret);

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = slackConfig.slackToken;
const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = slackConfig.testChannelID;

slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  if (event.text.includes('안녕')) {
    sendMessage ({channel: event.channel, text: '만나서 반가워!'}, function (result) {
      console.log('hello feedback', result);
    });
  }
});
slackEvents.on('error', console.error);
module.exports.slackEvents = slackEvents;

const sendMessage = function (messageObj, cb) {
  // See: https://api.slack.com/methods/chat.postMessage
  web.chat.postMessage(messageObj)
    .then((result) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', result.ts);
      cb(result);
    })
    .catch((err) => {
      console.error(err);
      cb(err);
    });
};

module.exports.sendMessage = sendMessage;