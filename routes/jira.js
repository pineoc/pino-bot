var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/webhook', (req, res) => {
  const reqBody = req.body;
  console.log('webhookEvent type: ', reqBody.webhookEvent);
  // webhookEvent -> 'jira:issue_updated'
  console.log('issue detail: ', reqBody.issue);
  // issue -> {key, fields:{}, }
  console.log('changelog: ', reqBody.changelog);
  // changelog -> [{}]
  // {field, fieldtype, from, fromString, to, toString}
});

module.exports = router;
