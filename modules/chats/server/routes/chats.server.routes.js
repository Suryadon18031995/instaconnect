'use strict';

var chats = require('../controllers/chats.server.controller');

module.exports = function(app) {
  app.route('/api/chats/offline').post(chats.sendOfflineMessage);
};
