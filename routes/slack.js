var express = require('express');
var router = express.Router();
const slackService = require('../service/slackService');
const jiraService = require('../service/jiraService');
const utilService = require('../service/utilService');

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

const getHelpText = function() {
  const text = `*Can Do*\n
- JIRA ticket info: JIRA Ticket Key included on message\n- Time: [time|시간] [all|모두]\n
*WIP*\n- help command`;
  return text;
};

const getTimeAttachment = function (isAll) {
  let attachment = [];
  if(isAll) {
    const times = utilService.getAllTime();
    attachment = [{'text': `:earth_asia: ${times[0].time}`, 'color': '#000000'}];
    for (let i = 1, len = times.length; i < len; i++) {
      const t = times[i];
      attachment[0].text += `\n:flag-${t.country}: ${t.time}`;
    }
  } else {
    const t = utilService.getTime();
    attachment = [{'text': `:${t.country}: ${t.time}`, 'color': '#000000'}];
  }
  return attachment;
};

const slackCommand = function(event) {
  // TODO: refactoring this command
  // add app_mention event type listener
  const text = event.text;
  const textParsed = text.split(' ');
  if (textParsed[1].includes('안녕') || textParsed[1].includes('hi')) {
    let msg = { 
      channel: event.channel,
      text: 'Hi, Hello, 만나서 반가워! :wave:\n> Manual: `도움` or `help`'
    };
    slackService.sendMessage(msg);
  }
  if (text.includes('도움') || text.includes('help')) {
    let msg = { 
      channel: event.channel,
      text: getHelpText()
    };
    slackService.sendMessage(msg);
  }
  if (textParsed[1] === '시간' || textParsed[1] === 'time') {
    let msg = {
      channel: event.channel,
      text: ':clock3: `WHAT TIME IS IT?`'
    };
    let isAll = false;
    if(textParsed[2] === '모두' || textParsed[2] === 'all') {
      isAll = true;
    }
    msg['attachments'] = getTimeAttachment(isAll);

    slackService.sendMessage(msg);
  }
};

slackService.slackEvents.on('app_mention', slackCommand);
slackService.slackEvents.on('error', console.error);

module.exports = router;
