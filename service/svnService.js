const svnUltimate = require('node-svn-ultimate');
const svnConf = require('../conf/svn.json');

function makeRevisionData (rev) {
  let result = Object.assign({}, rev.logentry);
  // make default data setting
  result.revision = result.$.revision; // make revision key
  delete result.$; // remove $ key
  // path data setting
  let paths = Object.assign({}, result.paths.path);
  // paths = [{path: 'a.txt', action: 'M/A/D/R'},...]

  console.warn('mkrev:', result);
  console.warn('path check:', paths);
  return result;
}

const getSvnLog = function (revision, cb) {
  let option = {revision, verbose: true};
  svnUltimate.commands.log(svnConf.url, option, function(err, rev) {
    // console.log('svn:', rev.logentry);
    // console.log('svn.paths: ', rev.logentry.paths, rev.logentry.paths.path[0]);
    let revisionData = {};
    if(rev === undefined)
      revisionData = rev;
    revisionData = makeRevisionData(rev);

    cb(err, revisionData);
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