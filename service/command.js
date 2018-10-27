const utilService = require('./utilService');
const jiraService = require('./jiraService');

const getHelpText = function () {
  let canDoText = '*Can Do*\n';
  const commandDescText = {
    '`JIRA ticket info`': 'JIRA Ticket Key included on message',
    '`Time`': '@helper [time | 시간] [all | 모두]',
    '`jira-status`': '@helper [jira-status | 지라상태]'
  };
  for (var command in commandDescText) {
    const text = commandDescText[command];
    canDoText += `- ${command}: ${text}\n`;
  }
  return canDoText;
};
const hiCommand = function (param, cb) {
  let msg = param.baseMsg;
  msg['text'] = 'Hi, Hello, 만나서 반가워! :wave:\n> Manual: `도움` or `help`';
  cb(msg);
};

const helpCommand = function (param, cb) {
  let msg = param.baseMsg;
  msg['text'] = getHelpText();
  cb(msg);
};
const getTimeAttachment = function (isAll) {
  let attachment = [];
  if (isAll) {
    const times = utilService.getAllTime();
    attachment = [{
      'text': `:earth_asia: ${times[0].time}`,
      'color': '#000000'
    }];
    for (let i = 1, len = times.length; i < len; i++) {
      const t = times[i];
      attachment[0].text += `\n:flag-${t.country}: ${t.time}`;
    }
  } else {
    const t = utilService.getTime();
    attachment = [{
      'text': `:${t.country}: ${t.time}`,
      'color': '#000000'
    }];
  }
  return attachment;
};

const timeCommand = function (param, cb) {
  let msg = param.baseMsg;
  let textParsed = param.textParsed;
  msg['text'] = ':clock3: `WHAT TIME IS IT?`';
  let isAllTime = false;
  if (textParsed[2] === '모두' || textParsed[2] === 'all') {
    isAllTime = true;
  }
  msg['attachments'] = getTimeAttachment(isAllTime);
  cb(msg);
};

const jiraStatusCommand = function (param, cb) {
  let msg = param.baseMsg;
  const statusColor = {
    'RUNNING': 'good',
    'ERROR': 'danger',
    'STOPPING': 'danger'
  };
  msg['text'] = 'JIRA status';
  jiraService.getJiraStatus((err, res) => {
    msg['attachments'] = [{
      color: statusColor[res.state],
      text: `*${res.state}*`
    }];
    cb(msg);
  });
};

const getCommandList = function () {
  const commandList = {
    'hi': ['hi', '안녕', hiCommand],
    'help': ['help', '도움', helpCommand],
    'time': ['time', '시간', timeCommand],
    'jira-status': ['jira-status', '지라상태', jiraStatusCommand]
  };
  return commandList;
};

module.exports = {
  getCommandList
};
