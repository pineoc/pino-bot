/*
Change jira account password script
*/
const fs = require('fs');
// const JiraClient = require('jira-connector');
const jsonConfPath = '../conf/jira.json';

// get id, password
if (process.argv.length < 4) {
  console.warn('please enter the id, password');
  return -1;
}
let id = process.argv[2];
let pwd = process.argv[3];

// check valid info
// async function checkCanLogin(conf, id, pwd){
//   let jira = new JiraClient({
//     host: conf.host,
//     basic_auth: {
//         username: id,
//         password: pwd
//     }
//   });
//   let ret = await jira.issue.getIssue({
//     issueKey: `${conf.testProjectKey}-9391`
//   }, function (err, res) {
//     console.log(err, res);
//     return {err, res};
//   });
//   console.log(ret);
//   return ret;
// }

// get jira.json file
fs.readFile(jsonConfPath, 'utf8', function(error, data) {
  if (error) {throw error;}
  let jiraConf = JSON.parse(data);
  // make base64
  // id:password
  let hash = Buffer.from(`${id}:${pwd}`).toString('base64');
  console.log('hashed:', hash);
  // set hash on jiraConf file
  jiraConf.basicAuthBase64 = hash;
  fs.writeFile(jsonConfPath, JSON.stringify(jiraConf, null, 2), 'utf8', function(err, data){
    if (error) {throw error;}
    console.log('Change auth complete!');
  });
});
