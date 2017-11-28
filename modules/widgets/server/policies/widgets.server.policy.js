'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Widgets Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin', 'user'],
    allows: [{
      resources: '/api/widgets',
      permissions: '*'
    }, {
      resources: '/api/widgets/:widgetId',
      permissions: '*'
    }, {
      resources: '/api/widgetByUser/:userId',
      permissions: ['get']
    }, {
      resources: '/api/widgetsByUser/:userId',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/widgets',
      permissions: ['get', 'post']
    }, {
      resources: '/api/widgets/:widgetId',
      permissions: ['get']
    }, {
      resources: '/api/widgetByUser/:userId',
      permissions: ['get']
    }, {
      resources: '/api/widgetsByUser/:userId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/widgets',
      permissions: ['get']
    }, {
      resources: '/api/widgets/:widgetId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Widgets Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Widget is being processed and the current user created it then allow any manipulation
  if (req.widget && req.user && req.widget.user && req.widget.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
