'use strict';

describe('Widgets E2E Tests:', function () {
  describe('Test Widgets page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/widgets');
      expect(element.all(by.repeater('widget in widgets')).count()).toEqual(0);
    });
  });
});
