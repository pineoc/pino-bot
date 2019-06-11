const express = require('express');
const router = express.Router();
const request = require('request');
const slackService = require('../service/slackService');
const svnService = require('../service/svnService');
const jiraService = require('../service/jiraService');

const errorMsg = {
  response_type: 'ephemeral',
  replace_original: false,
  text: 'Sorry, that didn\'t work. Please try again.'
};

// svn functions
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

// slack command router
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
  const payloadType = payload.type;
  // console.log('action Endpoint payload:', payload);
  if (payloadType === 'interactive_message') {
    interactiveMsgActor(payload, (msg) => {
      res.json(msg);
    });
  } else if (payloadType === 'block_actions') {
    blockMsgActor(req, payload, (msg) => {
      res.send(msg);
    });
  } else if (payloadType === 'message_action') {
    messageActor(payload, (msg) => {
      let msgObj = Object.assign({}, msg);

      slackService.sendMessage(msgObj, (result) => {
        responseSender(res, result);
      });
    });
  } else if (payloadType === 'dialog_submission') {
    messageActor(payload, (msg) => {
      let opt = {url: payload.response_url, msg};
      sendResponseMsgAction(opt, (resCode) => {
        res.status(resCode).json({});
      });
    });
  } else {
    res.status(500).json({});
  }
}
router.post('/action-endpoint', actionEndpoint);

function interactiveMsgActor (payload, cb) {
  // delete message
  if (payload.actions[0].value === 'delete') {
    cb('> message removed');
  } else if (payload.actions[0].name.includes('jiraInfo')) {
    const attachmentIdx = payload.actions[0].name.split(' ')[1];
    const originalMsg = Object.assign({}, payload.original_message);
    const additionalInfo = JSON.parse(payload.actions[0].value);

    originalMsg.attachments[attachmentIdx].fields = additionalInfo;
    delete originalMsg.attachments[attachmentIdx].actions;

    cb(originalMsg);
  } else {
    cb(errorMsg);
  }
}
function blockMsgActor (req, payload, cb) {
  // dialog test
  slackService.openJiraInfoDialog(req, cb);
}
function messageActor (payload, cb) {
  const msg = payload.message;
  if (payload.callback_id === 'action_get_jira_info') {
    slackService.checkTextForJiraTicket(msg.text, (result) => {
      let message = {
        thread_ts: msg.ts,
        text: 'Jira 정보 파밍!',
        channel: payload.channel.id,
        attachments: []
      };
      if (!result) {
        return cb({text: 'Info Not Found'});
      }

      let promises = getMakeAttachmentPromises(result);
      Promise.all(promises).then(function (values) {
        message.attachments = values;
        cb(message);
      });
    });    
  }
  if (payload.callback_id === 'action_create_jira_issue') {
    // TODO: dialog submission 로직 분리 필요
    if (payload.type === 'dialog_submission') {
      let msg = {
        response_type: 'ephemeral',
        text: 'create issue dialog submitted',
      };
      msg.text += `\n> ${JSON.stringify(payload.submission)}`;

      cb(msg);
    } else {
      slackService.openDialogTest(payload, (result) => {
        cb({response_type: 'ephemeral', text: 'create issue'});
      });
    }
  }
}
function sendResponseMsgAction (opt, cb) {
  var options = {
    uri: opt.url,
    method: 'POST',
    json: opt.msg
  };
  
  request(options, function (err, response) {
    if (!err && response.statusCode == 200) {
      cb(200);
    } else {
      cb(response.statusCode);
    }
  });
}
function getMakeAttachmentPromises (data) {
  let promises = [];
  for (let i = 0, len = data.length; i < len; i++) {
    let innerPromise = new Promise(resolve => {
      jiraService.getIssueByKeyFiltered(data[i], (d) => {
        slackService.makeSimpleAttachment(d, i, (attData) => {
          resolve(attData);
        });
      });
    });
    promises.push(innerPromise);
  }
  return promises;
}

module.exports = router;