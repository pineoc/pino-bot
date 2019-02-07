const utilService = require('./utilService');
const jiraService = require('./jiraService');
const dbService = require('./db');

const getHelpText = function () {
  let canDoText = '*Can Do*\n';
  const commandDescText = {
    '`JIRA ticket info`': `JIRA Ticket Key included on message\n> if \`${jiraService.jiraConfig.jiraOffKey||'!nj'}\` is included, jira info not displayed`,
    '`Time`': '@helper [time or 시간] [all or 모두 or 국가(country)]\n> country: kr, cn, jp, nl, us(ny, la)',
    '`jira-status`': '@helper [jira-status or 지라상태]',
    '`conch`': '@helper [conch or 소라고둥] question',
    '`jira-info`': '@helper [jira-info or 지라정보] [on or off]'
  };
  for (var command in commandDescText) {
    const text = commandDescText[command];
    canDoText += `- ${command}: ${text}\n`;
  }
  return canDoText;
};
const hiCommand = function (param, cb) {
  let msg = param.baseMsg;
  msg.text = 'Hi, Hello, 만나서 반가워! :wave:\n> Manual: `도움` or `help`';
  cb(msg);
};

const helpCommand = function (param, cb) {
  let msg = param.baseMsg;
  msg.text = getHelpText();
  cb(msg);
};
const getTimeAttachment = function (param) {
  let attachment = [];
  if (param === '모두' || param === 'all') {
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
    let t = param ? utilService.getTimeBySearch(param) : utilService.getTime();
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
  msg.text = ':clock3: `WHAT TIME IS IT?`';
  msg.attachments = getTimeAttachment(textParsed[2]);
  cb(msg);
};

const jiraStatusCommand = function (param, cb) {
  let msg = param.baseMsg;
  const statusColor = {
    'RUNNING': 'good',
    'ERROR': 'danger',
    'STOPPING': 'danger'
  };
  msg.text = 'JIRA status';
  jiraService.getJiraStatus((err, res) => {
    msg.attachments = [{
      color: statusColor[res.state],
      text: `*${res.state}*`
    }];
    cb(msg);
  });
};

const conchCommand = function (param, cb) {
  let msg = param.baseMsg;
  let textParsed = param.textParsed;
  if (textParsed.length < 3) {
    msg.text = ':shell: Huh?';
    return cb(msg);
  }

  let attachment = {
    thumb_url: 'https://user-images.githubusercontent.com/5077086/47601577-01d60280-da0e-11e8-87af-a2abe55efe12.jpg',
    title: ':shell: Magic Conch 마법의 소라고둥 :shell:'
  };
  if (utilService.getConchDecision()) {
    attachment.color = 'good';
    attachment.text = 'Yes(그래)\n';
  } else {
    attachment.color = 'danger';
    attachment.text = 'No(아니)\nNope Nope Nope';
  }
  msg.attachments = [attachment];
  cb(msg);
};
function jiraInfoCommandValidator(textParsed) {
  if (textParsed.length < 3) {
    return false;
  }
  let onOffStr = textParsed[2].toLowerCase();
  if (!(onOffStr === 'on' || onOffStr === 'off')) {
    return false;
  }
  return true;
}
const jiraInfoCommand = function (params, cb) {
  let msg = params.baseMsg;
  let textParsed = params.textParsed;
  let channel = params.event.channel;
  msg.text = 'JIRA info On/Off';

  if (jiraInfoCommandValidator(textParsed) === false) {
    msg.text = 'please enter the [on or off]';
    return cb(msg);
  }

  let onOffStr = textParsed[2].toLowerCase();
  let isOn = (onOffStr === 'on') ? true : false;
  let info = {channel: channel, isOn: isOn};
  dbService.setJiraInfo(info, (res) => {
    if (res === undefined) {
      msg.text = 'error occured';
      return cb(msg);
    }
    let att = {
      color: isOn ? 'good' : 'danger',
      text: isOn ? 'JIRA info on' : 'JIRA info off'
    };
    msg.attachments = [att];
    cb(msg);
  });
};

const getCommandList = function () {
  const commandList = {
    'hi': ['hi', '안녕', hiCommand],
    'help': ['help', '도움', helpCommand],
    'time': ['time', '시간', timeCommand],
    'jira-status': ['jira-status', '지라상태', jiraStatusCommand],
    'conch': ['conch', '소라고둥', conchCommand],
    'jira-info': ['jira-info', '지라정보', jiraInfoCommand]
  };
  return commandList;
};

module.exports = {
  getCommandList
};
