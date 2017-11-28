'use strict';

var path = require('path');
var contacts = require('../controllers/contacts.server.controller'),
  users = require(path.resolve('./modules/users/server/controllers/users/users.authorization.server.controller'));

module.exports = function (app) {
  app.route('/api/contacts/:userId').get(contacts.getContacts);

  app.param('userId', users.userByID);
};
