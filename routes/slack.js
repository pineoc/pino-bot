var express = require('express');
var router = express.Router();
const { WebClient } = require('@slack/client');
const slackService = require('./slackService');

router.get('/', function(req, res, next) {
  res.send('slack router index');
});

// router.post('/events', slackService.slackEvents.expressMiddleware());

module.exports = router;