'use strict';

var notifications = require('../controllers/push_notifications.server.controller');

module.exports = function(app) {
  app.route('/api/notifications')
    .post(notifications.sendNotification);
};
