var express = require('express');
var router = express.Router();
const slackService = require('../service/slackService');
const jiraService = require('../service/jiraService');
const commandModule = require('../service/command');
const dbService = require('../service/db');

let index = function (req, res) {
  res.send('slack router index');
};
router.get('/', index);

router.use('/events', slackService.slackEvents.expressMiddleware());

const getBlocksPromises = function (data) {
  let promises = [];
  for (let i = 0, len = data.length; i < len; i++) {
    let innerPromise = new Promise(resolve => {
      jiraService.getIssueByKeyFiltered(data[i], (d) => {
        slackService.blockBuilder(d, i, (block) => {
          resolve(block);
        });
      });
    });
    promises.push(innerPromise);
  }
  return promises;
};

const getMakeAttachmentPromises = function (data) {
  let promises = [];
  for (let i = 0, len = data.length; i < len; i++) {
    let innerPromise = new Promise(resolve => {
      jiraService.getIssueByKeyFiltered(data[i], (d) => {
        slackService.makeAttachment(d, i, (attData) => {
          resolve(attData);
        });
      });
    });
    promises.push(innerPromise);
  }
  return promises;
};
const sendJiraInfoMessage = function (eventInfo) {
  slackService.checkTextForJiraTicket(eventInfo.text, (result) => {
    let message = {
      channel: eventInfo.channel,
      attachments: []
    };
    let promises = getMakeAttachmentPromises(result);
    Promise.all(promises).then(function (values) {
      message.attachments = values;
      slackService.sendMessage(message);
    });
  });
};
const sendJiraInfoMessageBeta = function (eventInfo) {
  slackService.checkTextForJiraTicket(eventInfo.text, (result) => {
    let message = {
      channel: eventInfo.channel,
      blocks: []
    };
    let promises = getBlocksPromises(result);
    Promise.all(promises).then(function (values) {
      message.blocks = values;
      slackService.sendMessage(message);
    });
  });
};

const slackMessage = function (event) {
  // Ignore when slack bot events OR thread message
  if (event.user === undefined || event.thread_ts)
    return;
  // Ignore when jira info off key included on msg 
  if (jiraService.isIncludeJiraInfoOffKey(event.text))
    return;
  
  // beta function slack jira info
  if (slackService.isIncludeBetaFlag(event.text)) {
    sendJiraInfoMessageBeta(event);
    return;
  }

  // Send jira info on db channel isOn == true
  dbService.getJiraInfoChannel({channel: event.channel}, (res) => {
    if (res === undefined || res.isOn) {
      sendJiraInfoMessage(event);
    }
  });
};

const slackCommand = function (event) {
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
      cl[2].call(this, {baseMsg, textParsed, event}, (msg) => {
        slackService.sendMessage(msg);
      });
    }
  }
};

slackService.slackEvents.on('message', slackMessage);
slackService.slackEvents.on('app_mention', slackCommand);
slackService.slackEvents.on('error', console.error);

module.exports = router;
