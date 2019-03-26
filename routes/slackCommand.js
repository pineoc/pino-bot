var express = require('express');
var router = express.Router();
const slackService = require('../service/slackService');
const svnService = require('../service/svnService');

function getRevision (rev) {
  return isNaN(parseInt(rev)) ? -1 : parseInt(rev);
}

function svnCmdMessageBuilder (msgObj, rev, cb) {
  let message = {
    channel: msgObj.channelId,
    text: `${msgObj.text} <@${msgObj.userId}>`,
    attachments: []
  };

  svnService.getSvnLog(rev, function(err, data) {
    data.err = err;
    slackService.makeAttachmentSvn(data, function(attachment) {
      message.attachments = attachment;
      cb(message);
    });
  });
}

function svnMergeRequestCmd(msg, cb) {
  let requestRev = getRevision(msg.commandText);
  msg.text = 'Merge requested revision by';

  svnCmdMessageBuilder(msg, requestRev, function(svnMsg) {
    slackService.sendMessage(svnMsg, cb);
  });
}
function svnCmd(msg, cb) {
  let requestRev = getRevision(msg.commandText);
  msg.text = 'Requested revision by';

  svnCmdMessageBuilder(msg, requestRev, function(svnMsg) {
    slackService.sendMessage(svnMsg, cb);
  });
}

function responseSender(response, result) {
  if (result.ok)
    response.status(200).send();
  else
    response.status(500).send();
}

function slackCommandRouter (req, res) {
  const request = req.body;
  let channelId = request.channel_id;
  let userId = request.user_id;
  let command = request.command;
  let commandText = request.text;

  switch (command) {
  case '/merge-request':
    svnMergeRequestCmd({channelId, userId, commandText}, function (result) {
      responseSender(res, result);
    });
    break;
  case '/svn':
    svnCmd({channelId, userId, commandText}, function (result) {
      responseSender(res, result);
    });
    break;
  default:
    res.status(500).send('no command');
    break;
  }
}
router.post('/', slackCommandRouter);

// interactive Component listener
function actionEndpoint (req, res) {
  const payload = JSON.parse(req.body.payload);
  // delete message
  if (payload.actions[0].value === 'delete') {
    res.send('> message removed');
  } else if (payload.actions[0].name.includes('jiraInfo')) {
    const attachmentIdx = payload.actions[0].name.split(' ')[1];
    const originalMsg = Object.assign({}, payload.original_message);
    const additionalInfo = JSON.parse(payload.actions[0].value);

    originalMsg.attachments[attachmentIdx].fields = additionalInfo;
    delete originalMsg.attachments[attachmentIdx].actions;

    res.json(originalMsg);
  } else {
    res.json({
      'response_type': 'ephemeral',
      'replace_original': false,
      'text': 'Sorry, that didn\'t work. Please try again.'
    });
  }
}
router.post('/action-endpoint', actionEndpoint);

module.exports = router;