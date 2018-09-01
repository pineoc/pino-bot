var express = require('express');
var router = express.Router();
const slackService = require('./slackService');
const jiraService = require('./jiraService');

router.get('/', function (req, res) {
  res.send('slack router index');
});

// interactive Component listener
router.post('/action-endpoint', function (req, res) {
  res.send('action!');
});

router.use('/events', slackService.slackEvents.expressMiddleware());
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
    var promises = [];
    for (var i = 0, len = result.length; i < len; i++) {
      let innerPromise = new Promise((resolve) => {
        jiraService.getIssueByKeyFiltered(result[i], (data) => {
          slackService.makeAttachment(data, (attData) => {
            resolve(attData);
          });
        });
      });
      promises.push(innerPromise);
    }
    Promise.all(promises).then(function (values) {
      message.attachments = values;
      slackService.sendMessage(message);
    });
  });
});
slackService.slackEvents.on('app_mention', function (event) {
  // add app_mention event type listener
  if (event.text.includes('안녕') || event.text.includes('Hi')) {
    let msg = { 
      channel: event.channel,
      text: 'Hi, Hello, 만나서 반가워! :wave:\n> Manual: `도움` or `Help`'
    };
    slackService.sendMessage(msg);
  }
  if (event.text.includes('도움') || event.text.includes('Help')) {
    let msg = { 
      channel: event.channel,
      text: '*Can Do*\n- JIRA ticket info\n*WIP*\n- help command'
    };
    slackService.sendMessage(msg);
  }
});
slackService.slackEvents.on('error', console.error);

module.exports = router;
