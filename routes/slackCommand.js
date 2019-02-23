var express = require('express');
var router = express.Router();
const slackService = require('../service/slackService');
const svnService = require('../service/svnService');

function svnRequestCommand(channelId, userId, commandText, cb) {
  let requestRev = isNaN(parseInt(commandText)) ? -1 : parseInt(commandText);
  let message = {
    channel: channelId,
    text: `Merge requested revision by <@${userId}>`,
    attachments: []
  };

  svnService.getSvnLog(requestRev, function(err, data) {
    data.err = err;
    slackService.makeAttachmentSvn(data, function(attachment) {
      message.attachments = attachment;
      slackService.sendMessage(message, cb);
    });
  });
}
function svnInfoCommand(channelId, userId, commandText, cb) {
  let requestRev = isNaN(parseInt(commandText)) ? -1 : parseInt(commandText);
  let message = {
    channel: channelId,
    text: `Requested revision by <@${userId}>`,
    attachments: []
  };

  svnService.getSvnLog(requestRev, function(err, data) {
    data.err = err;
    slackService.makeAttachmentSvn(data, function(attachment) {
      message.attachments = attachment;
      slackService.sendMessage(message, cb);
    });
  });
}

function slackCommandDist (req, res) {
  const request = req.body;
  let channelId = request.channel_id;
  let userId = request.user_id;
  let command = request.command;
  let commandText = request.text;

  switch (command) {
  case '/merge-request':
    svnRequestCommand(channelId, userId, commandText, function (result) {
      if (result.ok)
        res.status(200).send();
      else
        res.status(500).send();
    });
    break;
  case '/svn':
    svnInfoCommand(channelId, userId, commandText, function (result) {
      if (result.ok)
        res.status(200).send();
      else
        res.status(500).send();
    });
    break;
  default:
    res.status(500).send('no command');
    break;
  }
}
router.post('/', slackCommandDist);

// interactive Component listener
let actionEndpoint = function (req, res) {
  const payload = JSON.parse(req.body.payload);
  console.warn(payload.actions, payload.callback_id);
  // delete message
  if (payload.actions[0].value === 'delete') {
    res.send('> message removed');
  } else {
    res.json({
      'response_type': 'ephemeral',
      'replace_original': false,
      'text': 'Sorry, that didn\'t work. Please try again.'
    });
  }
};
router.post('/action-endpoint', actionEndpoint);

module.exports = router;