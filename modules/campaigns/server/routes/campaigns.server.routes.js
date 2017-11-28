'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var campaignsPolicy = require('../policies/campaigns.server.policy'),
  campaigns = require('../controllers/campaigns.server.controller'),
  users = require(path.resolve('./modules/users/server/controllers/users/users.authorization.server.controller'));

module.exports = function(app) {
  // Campaigns Routes
  app.route('/api/campaigns').all(campaignsPolicy.isAllowed)
    .get(campaigns.list)
    .post(campaigns.create);

  app.route('/api/campaigns/:campaignId').all(campaignsPolicy.isAllowed)
    .get(campaigns.read)
    .put(campaigns.update)
    .delete(campaigns.delete);

  // Finish by binding the Campaign middleware
  app.param('userId', users.userByID);
  app.param('campaignId', campaigns.campaignByID);
};
