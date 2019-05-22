const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
var crypto = require('crypto');

const adapter = new FileSync('conf/db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ jiraInfoChannels: [], worklogs: [] })
  .write();

function getDBState(cb) {
  const res = db.getState();
  cb(res);
}
// TODO: refactor(move) functions to jira service
function getJiraInfoChannels(cb) {
  const res = db.get('jiraInfoChannels').value();
  cb(res);
}
function getJiraInfoChannel(params, cb) {
  const res = db.get('jiraInfoChannels')
    .find({id: params.channel}).value();
  cb(res);
}
function addJiraInfoChannel(params, cb) {
  const checkExist = db.get('jiraInfoChannels')
    .find({id: params.channel}).value();
  if (checkExist === undefined) {
    const res = db.get('jiraInfoChannels')
      .push({id: params.channel, isOn: true})
      .write();
    return cb(res);
  }
  cb(checkExist);
}
function setJiraInfo(params, cb) {
  addJiraInfoChannel(params, () => {
    const res = db.get('jiraInfoChannels')
      .find({id: params.channel})
      .assign({isOn: JSON.parse(params.isOn)})
      .write();
    cb(res);
  });
}


function getHash(str) {
  let shasum = crypto.createHash('sha1');
  shasum.update(params.user);
  const hash = shasum.digest('hex');
  return hash;
}
// 출퇴근 시간을 가져옵니다.
function getWorklog(params, cb) {
  let userHash = getHash(param.user_id);
  const res = db.get('worklogs').find({user: userHash}).value();
  cb(res);
}

// 출퇴근 시간을 추가합니다.
function addWorklog(params, cb) {
  let userHash = getHash(param.user_id);
}

// 등록되어있는 출퇴근 시간을 변경합니다.
function updateWorklog(params, cb) {
  let userHash = getHash(param.user_id);
}

// 당일 출근 시간을 입력합니다.
function addStartWorklog(params, cb) {
  let userHash = getHash(param.user_id);
  const res = db.get('worklogs')
    .push({user: userHash, startTime: params.startWork})
    .write();
  return cb(res);
}

// 당일 퇴근 시간을 입력합니다.
function addEndWorklog(params, cb) {
  let userHash = getHash(param.user_id);
  const res = db.get('worklogs')
    .find({user: userHash})
    .assign({endTime: params.endWork})
    .write();
  return cb(res);
}

module.exports = {
  getDBState,
  getJiraInfoChannels,
  getJiraInfoChannel,
  setJiraInfo
};