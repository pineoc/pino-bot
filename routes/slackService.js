const slackConfig = require('../conf/slack.json');
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(slackConfig.signingSecret);

slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});
slackEvents.on('error', console.error);

module.exports.slackEvents = slackEvents;