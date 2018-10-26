var express = require('express');
var router = express.Router();
const slackService = require('../service/slackService');
const jiraService = require('../service/jiraService');
const commandModule = require('../service/command');

router.get('/', function (req, res) {
  res.send('slack router index');
});

// interactive Component listener
router.post('/action-endpoint', function (req, res) {
  res.send('action!');
});

router.use('/events', slackService.slackEvents.expressMiddleware());

const getMakeAttachmentPromises = function (data) {
  let promises = [];
  for (var i = 0, len = data.length; i < len; i++) {
    let innerPromise = new Promise((resolve) => {
      jiraService.getIssueByKeyFiltered(data[i], (data) => {
        slackService.makeAttachment(data, (attData) => {
          resolve(attData);
        });
      });
    });
    promises.push(innerPromise);
  }
  return promises;
};
slackService.slackEvents.on('message', (event) => {
  // slack bot events
  if (event.user === undefined)
    return;

  slackService.checkTextForJiraTicket(event.text, (result) => {
    let message = {
      channel: event.channel,
      text: 'JIRA Report',
      attachments: []
    };
    let promises = getMakeAttachmentPromises(result);
    Promise.all(promises).then(function (values) {
      message.attachments = values;
      slackService.sendMessage(message);
    });
  });
});

const slackCommand = function (event) {
  // TODO: refactoring this command
  // add app_mention event type listener
  const text = event.text;
  const textParsed = text.split(' ');
  let baseMsg = {
    channel: event.channel
  };
  const commandList = commandModule.getCommandList();

  for (var command in commandList) {
    const cl = commandList[command];
    if (textParsed[1] === cl[0] || textParsed[1] === cl[1]) {
      cl[2].call(this, {baseMsg, textParsed}, (msg) => {
        slackService.sendMessage(msg);
      });
    }
  }
};

slackService.slackEvents.on('app_mention', slackCommand);
slackService.slackEvents.on('error', console.error);

module.exports = router;
