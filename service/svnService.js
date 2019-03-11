const moment = require('moment-timezone');
const svnUltimate = require('node-svn-ultimate');
const svnConf = require('../conf/svn.json');
const util = require('../service/utilService');

function makePaths (result) {
  let res = result;
  // path data setting
  let paths = Object.assign({}, res.paths.path);
  let pathsLenght = res.paths.path.length;
  if (pathsLenght === undefined) {
    paths = [res.paths.path];
    pathsLenght = 1;
  }
  // check path length for one modified revision
  delete res.paths;
  res.paths = [];
  // paths = [{path: 'a.txt', action: 'M/A/D/R'},...]
  for(let i = 0; i < pathsLenght; i++) {
    let path = paths[i];
    let newPath = {};
    newPath.path = path._;
    newPath.action = path.$.action;
    res.paths.push(newPath);
  }
  return res.paths;
}

function makeRevisionData (rev) {
  let result = Object.assign({}, rev.logentry);
  // make default data setting
  result.revision = result.$.revision; // make revision key
  delete result.$; // remove $ key
  if (result.paths) {
    result.paths = makePaths(result);
  }
  
  let time = moment.utc(result.date).unix();
  result.ts = time;
  result.date = result.date;

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