const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

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
});
