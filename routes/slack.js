var express = require('express');
var router = express.Router();
const slackService = require('./slackService');
const jiraService = require('./jiraService');

router.get('/', function (req, res) {
  res.send('slack router index');
});

router.use('/events', slackService.slackEvents.expressMiddleware());
slackService.slackEvents.on('message', (event) => {
  // console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  if (event.user === undefined)
    return;

  slackService.checkText(event.text, (result) => {
    if (result === 'test') {
      slackService.sendMessage({ channel: event.channel, text: '만나서 반가워!' }, (res) => {
        console.log(res);
      });
    } else {
      let message = {
        channel: event.channel,
        text: 'JIRA Report',
        attachments: []
      };
      var promises = [];
      for (var i = 0, len = result.length; i < len; i++) {
        let innerPromise = new Promise(function (resolve) {
          jiraService.getIssueByKeyFiltered(result[i], (data) => {
            slackService.makeAttachment(data, (attData) => {
              resolve(attData);
            });
          });
        });
        promises.push(innerPromise);
      }
      Promise.all(promises).then(function (values) {
        console.log('current message:', values);
        message.attachments = values;
        slackService.sendMessage(message, (res) => {
          console.log('send result: ', res);
        });
      });
    }
  });
});
slackService.slackEvents.on('error', console.error);

module.exports = router;