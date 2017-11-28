'use strict';

/**
 * Module dependencies
 */
var organizationsPolicy = require('../policies/organizations.server.policy'),
  organizations = require('../controllers/organizations.server.controller');

module.exports = function(app) {
  // Organizations Routes
  app.route('/api/organizations').all(organizationsPolicy.isAllowed)
    .get(organizations.list)
    .post(organizations.createNew);

  app.route('/api/organizations/:organizationId').all(organizationsPolicy.isAllowed)
    .get(organizations.read)
    .put(organizations.update)
    .delete(organizations.delete);

  app.route('/api/organizations/:organizationId/members').all(organizationsPolicy.isAllowed)
    .get(organizations.getMembers);

  app.route('/api/deactivateUser').post(organizations.deactivateUser);

  // Finish by binding the Organization middleware
  app.param('organizationId', organizations.organizationByID);
};
