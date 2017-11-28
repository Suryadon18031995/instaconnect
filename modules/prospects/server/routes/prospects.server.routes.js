'use strict';

var prospects = require('../controllers/prospects.server.controller');

module.exports = function(app) {
  app.route('/api/prospects')
    .get(prospects.listNew)
    .post(prospects.create);

  app.route('/api/prospects/:prospectsId')
    .get(prospects.read)
    .put(prospects.update)
    .delete(prospects.delete);

  app.route('/api/saveLocationInfo').post(prospects.saveLocationInfo);

  // Finish by binding the Prospects middleware
  app.param('prospectsId', prospects.prospectsByID);
};
