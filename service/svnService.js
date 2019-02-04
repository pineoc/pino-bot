const moment = require('moment-timezone');
const svnUltimate = require('node-svn-ultimate');
const svnConf = require('../conf/svn.json');
const util = require('../service/utilService');

function makeRevisionData (rev) {
  let result = Object.assign({}, rev.logentry);
  // make default data setting
  result.revision = result.$.revision; // make revision key
  delete result.$; // remove $ key
  // path data setting
  let paths = Object.assign({}, result.paths.path);
  let pathsLenght = result.paths.path.length;
  if (pathsLenght === undefined) {
    paths = [result.paths.path];
    pathsLenght = 1;
  }
  // check path length for one modified revision
  delete result.paths;
  result.paths = [];
  // paths = [{path: 'a.txt', action: 'M/A/D/R'},...]
  for(let i = 0; i < pathsLenght; i++) {
    let path = paths[i];
    let newPath = {};
    newPath.path = path._;
    newPath.action = path.$.action;
    result.paths.push(newPath);
  }
  let time = moment.utc(result.date).unix();
  let date = util.getTimeBySearch('seoul').time;
  result.ts = time;
  result.date = date;

  return result;
}

const getSvnLog = function (revision, cb) {
  let option = {revision, verbose: true};
  svnUltimate.commands.log(svnConf.url, option, function(err, rev) {
    let revisionData = {};
    if(rev) {
      revisionData = makeRevisionData(rev);
    }
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