var express = require('express');
var router = express.Router();
const slackService = require('../service/slackService');
const svnService = require('../service/svnService');

function svnCommand(channelId, userId, commandText) {
  let requestRev = isNaN(parseInt(commandText)) ? -1 : parseInt(commandText);
  let message = {
    channel: channelId,
    text: `revision requested by <@${userId}>`,
    attachments: []
  };

  svnService.getSvnLog(requestRev, function(err, data) {
    data.err = err;
    slackService.makeAttachmentSvn(data, function(attachment) {
      message.attachments = attachment;
      slackService.sendMessage(message);
    });
  });
}

router.post('/', function (req, res) {
  const request = req.body;
  let channelId = request.channel_id;
  let userId = request.user_id;
  let command = request.command;
  let commandText = request.text;
  switch (command) {
  case '/svn':
    svnCommand(channelId, userId, commandText);
    break;
  }
  res.send('');
});

module.exports = router;