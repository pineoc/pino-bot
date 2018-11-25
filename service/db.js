const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('conf/db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ jiraInfoChannels: [] })
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

module.exports = {
  getDBState,
  getJiraInfoChannels,
  getJiraInfoChannel,
  setJiraInfo
};