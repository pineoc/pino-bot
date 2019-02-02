const svnUltimate = require('node-svn-ultimate');
const svnConf = require('../conf/svn.json');

const getSvnLog = function (revision, cb) {
  const option = {revision, verbose: true};
  svnUltimate.commands.log(svnConf.url, option, function(err, rev) {
    //console.log(option, rev);
    cb(err, rev);
  });
};
const getSvnHeadRevision = function (cb) {
  svnUltimate.util.getRevision(svnConf.url, function (err, rev) {
    cb(err, rev);
  });
};

module.exports = {
  getSvnLog,
  getSvnHeadRevision
};