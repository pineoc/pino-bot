const slackConfig = require('../conf/slack.json');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/client');
const slackEvents = createEventAdapter(slackConfig.signingSecret);

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = slackConfig.slackToken;
const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = slackConfig.testChannelID;

const checkText = function (text, cb) {
  // Ref: https://community.atlassian.com/t5/Bitbucket-questions/Regex-pattern-to-match-JIRA-issue-key/qaq-p/233319
  const jiraMatcher = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;
  let t = text.match(jiraMatcher);
  if (t != null && t.length > 0) {
    // jira ticket string in text
    cb(t);
  } else if (text === '안녕') {
    // test text
    cb('test');
  } else {
    // default messaging
    cb('default');
  }
};
// export for test
module.exports.checkText = checkText;

slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  if (event.user === undefined)
    return;
  
  checkText(event.text, (result) => {
    if (result === 'test') {
      sendMessage ({channel: event.channel, text: '만나서 반가워!'}, function (res){
        console.log(res);
      });
    } else if (result === 'default'){
      sendMessage ({channel: event.channel, text: `반사! ${event.text}`}, function (res){
        console.log(res);
      });
    } else {
      let message = {
        channel: event.channel,
        text: 'JIRA Report',
        attachments: []
      };
      result.forEach(element => {
        message.attachments.push({text: element, color: '#2eb886'});
      });
      sendMessage (message, function (res){
        console.log(res);
      });
    }
  });
});
slackEvents.on('error', console.error);
module.exports.slackEvents = slackEvents;

// send Message to slack channel
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