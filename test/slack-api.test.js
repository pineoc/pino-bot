const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const slackService = require('../service/slackService');

const url = 'http://localhost:3000';

describe('Request test url', () => {
  it('request to server', done => {
    chai.request(url)
      .get('/test')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('End to End Slack apis', function () {
  it('send message good', function (done) {
    const sampleData = {text: 'test JIRA-1234'};

    chai.request(url)
      .post('/test/send-text')
      .send(sampleData)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  describe('slack command test', function () {
    // WARNING: this test need to create svn repo
    it('/merge-request command test', function (done) {
      const sample = {
        token: 'token',
        team_id: 'team_id',
        team_domain: 'team_domain',
        channel_id: slackService.slackConfig.testChannelID,
        channel_name: 'channel_name',
        user_id: 'user_id',
        user_name: 'user',
        command: '/merge-request',
        text: '1',
        response_url: 'test',
        trigger_id: 'test'
      };
      chai.request(url)
        .post('/slack-cmd')
        .send(sample)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });
    it('/svn command test', function (done) {
      const sample = {
        token: 'token',
        team_id: 'team_id',
        team_domain: 'team_domain',
        channel_id: slackService.slackConfig.testChannelID,
        channel_name: 'channel_name',
        user_id: 'user_id',
        user_name: 'user',
        command: '/svn',
        text: '2',
        response_url: 'test',
        trigger_id: 'test'
      };
      chai.request(url)
        .post('/slack-cmd')
        .send(sample)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });
  });
  
});
