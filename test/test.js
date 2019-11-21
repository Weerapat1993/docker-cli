const request = require("request");
const expect = require("chai").expect;
const baseUrl = "https://swapi.co/api";

describe('returns luke', () => {
  it('returns luke', (done) => {
    request.get({ url: baseUrl + '/people/1/' }, (error, response, body) => {
      const bodyObj = JSON.parse(body);
      expect(bodyObj.name).to.equal("Luke Skywalker");
      expect(bodyObj.hair_color).to.equal("blond");
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});