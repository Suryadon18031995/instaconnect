'use strict';

describe('Campaigns E2E Tests:', function () {
  describe('Test Campaigns page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/campaigns');
      expect(element.all(by.repeater('campaign in campaigns')).count()).toEqual(0);
    });
  });
});
