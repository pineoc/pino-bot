const Client = require('svn-spawn');
const svnConf = require('../conf/svn.json');
const client = new Client({
  cwd: svnConf.url,
  username: svnConf.id,
  password: svnConf.pwd
});
const getSvnLog = function (revision, cb) {
  client.getLog(`-r ${revision}`, (err, result) => {
    cb(err, result);
  });
};

module.exports = {
  getSvnLog
};