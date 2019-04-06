const slackConfig = require('../conf/slack.json');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/client');
const axios = require('axios');
const slackEvents = createEventAdapter(slackConfig.signingSecret);

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = slackConfig.slackToken;
const web = new WebClient(token);

function checkTextForJiraTicket (text, cb) {
  // Ref: https://community.atlassian.com/t5/Bitbucket-questions/Regex-pattern-to-match-JIRA-issue-key/qaq-p/233319
  const jiraMatcher = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;
  // const jiraMatcher = /((?<!([A-Za-z]{1,10})-?)[A-Z]+-\d+)/g;
  let t = text.match(jiraMatcher);
  if (text.includes('onenote:')) {
    return cb(null);
  }
  if (t != null && t.length > 0) {
    // jira ticket string in text
    return cb(t);
  }
}

// send Message to slack channel
const sendMessage = function (msgObj, cb) {
  // See: https://api.slack.com/methods/chat.postMessage
  web.chat.postMessage(msgObj)
    .then((result) => {
      if(cb) cb(result);
    })
    .catch((err) => {
      if(cb) cb(err);
    });
};

function isJiraDataExist (data) {
  return !(data.errorMessages || data.key === undefined);
}
function makeAttachmentFields (data) {
  let fields = [
    {
      'title': 'Priority',
      'value': `:${data.priority}:`,
      'short': true
    }, {
      'title': 'Status',
      'value': data.status,
      'short': true
    }, {
      'title': 'Assignee',
      'value': data.assignee,
      'short': true
    }, {
      'title': 'Reporter',
      'value': data.reporter,
      'short': true
    }, {
      'title': 'Fix Version',
      'value': data.fixVersion.join(),
      'short': false
    }
  ];
  return fields;
}
const makeAttachment = function (data, idx, cb) {
  let attachment;
  let attachmentFields;
  if (isJiraDataExist(data) === false) {
    attachment = {'title': 'Issue Does Not Exist', 'color': '#000000'};
    return cb(attachment);
  }
  attachmentFields = makeAttachmentFields(data);
  attachment = {
    'callback_id': 'jira-info',
    'author_name': data.issueTypeName,
    'fallback': `[${data.key}] ${data.summary}`,
    'color': data.issueColor,
    'title': `[${data.key}] ${data.summary}`,
    'title_link': data.issueLink,
    'actions': [{
      'name': `jiraInfo ${idx}`,
      'text': 'More Info',
      'style': 'primary',
      'type': 'button',
      'value': JSON.stringify(attachmentFields)
    }]
  };
  cb(attachment);
};
const makeChangelogAttachment = function (data, cb) {
  let attachment;
  if (isJiraDataExist(data) === false) {
    attachment = {'title': 'Issue Does Not Exist', 'color': '#000000'};
    return cb(attachment);
  }
  let assignee = data.fields.assignee;
  let cf = data.fields.customfield_10503;
  let userName = data.user.displayName;
  attachment = {
    'color': data.issueColor,
    'title': `[${data.key}] ${data.fields.summary}`,
    'title_link': data.issueLink,
    'fields': [
      {
        'title': 'Status',
        'value': data.statusString,
        'short': true
      }, {
        'title': 'Change By',
        'value': userName,
        'short': true
      }, {
        'title': 'Priority',
        'value': `:${data.fields.priority.name}:`,
        'short': true
      }, {
        'title': 'Severity',
        'value': cf === undefined ? 'None' : cf.value,
        'short': true
      }, {
        'title': 'Assignee',
        'value': assignee === null ? 'Unassigned' : assignee.displayName,
        'short': true
      }, {
        'title': 'Reporter',
        'value': data.fields.reporter.displayName,
        'short': true
      }
    ],
    'footer': 'JIRA tracker'
  };
  cb(attachment);
};
const makeAttachmentSvn = function(data, cb) {
  let attachment = {};
  if (data.err || data === null) {
    attachment = {'title': 'Revision Does Not Exist', 'color': '#000000'};
    return cb([attachment]);
  }
  attachment = {
    'callback_id': 'svn-log',
    'color': '#36a64f',
    'author_name': `Author: ${data.author}`,
    'title': `Revision: ${data.revision}`,
    'text': data.msg,
    'fields': [{'title': 'date', 'value': data.date}],
    'actions': [{
      'name': 'svn',
      'text': 'Delete',
      'style': 'danger',
      'type': 'button',
      'value': 'delete',
      'confirm': {
        'title': 'Delete SVN Message',
        'text': 'Are you sure you want to delete this message?',
        'ok_text': 'Yes',
        'dismiss_text': 'No'
      }
    }],
    'ts': data.ts
  };
  let changedText = '';
  let changedAttachment = {};
  if (data.paths) {
    for (let i = 0; i < data.paths.length; i++) {
      let p = data.paths[i];
      changedText += `[${p.action}] ${p.path}\n`;
    }
    changedAttachment = {
      'title': 'Changed path',
      'text': changedText
    };
  }

  cb([attachment, changedAttachment]);
};

function blockBuilder (data, idx, cb) {
  let block = {};
  if (isJiraDataExist(data) === false) {
    block = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '> Issue Does Not Exist'
      }
    };
    return cb(block);
  }

  // make info block
  block = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `<${data.issueLink}|[${data.key}] ${data.summary}>`
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'More',
      },
      value: JSON.stringify(data),
      action_id: `jiraInfo: ${idx}`
    }
  };
  block.text.text += `\n*[${data.issueTypeName}]*`;
  block.text.text += ` :${data.priority}:/`;
  block.text.text += ` \`${data.status}\`/`;
  block.text.text += ` ${data.assignee}`;
  cb(block);
}

function openDialog (req, cb) {
  const payload = JSON.parse(req.body.payload);
  const jiraData = JSON.parse(payload.actions[0].value);
  let dialog = {
    'callback_id': 'jira-dialog',
    'title': 'JIRA infos',
    'submit_label': 'Request',
    'state': 'Limo',
    'elements': [
      {
        type: 'text',
        label: 'Title',
        name: 'info_title',
        value: jiraData.summary,
        hint: jiraData.issueLink
      }, {
        type: 'textarea',
        label: 'Description',
        name: 'info_desc',
        value: jiraData.description
      }, {
        type: 'text',
        label: 'Priority',
        name: 'info_priority',
        value: jiraData.priority
      }, {
        type: 'text',
        label: 'Assignee',
        name: 'info_assignee',
        value: jiraData.assignee
      }, {
        type: 'textarea',
        label: 'fix version',
        name: 'info_fixversion',
        value: jiraData.fixVersion.join('\\r\\n')
      }
    ]
  };
  (async () => {
    try {
      // Open dialog
      let tid = payload.trigger_id;
      const response = await web.dialog.open({ 
        trigger_id: tid,
        dialog,
      });
    } catch (error) {
      console.log(error);
      axios.post(payload.response_url, {
        response_type: 'ephemeral',
        replace_original: false,
        text: `An error occurred while opening the dialog: ${error.message}`,
      }).catch(console.error);
    }
  })();
  cb(true);
}

function isIncludeBetaFlag (str) {
  const betaKey = slackConfig.betaFlag || '!beta';
  return str.includes(betaKey);
}

module.exports = {
  slackConfig,
  slackEvents,
  checkTextForJiraTicket,
  sendMessage,
  makeAttachment,
  makeChangelogAttachment,
  makeAttachmentSvn,
  blockBuilder,
  openDialog,
  isIncludeBetaFlag
};
