var express = require('express');
var router = express.Router();
const { WebClient } = require('@slack/client');
const slackConfig = require('../conf/slack.json');

router.get('/', function(req, res, next) {
  res.send('slack router index');
});

module.exports = router;