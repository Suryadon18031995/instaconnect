'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var widgetsPolicy = require('../policies/widgets.server.policy'),
  widgets = require('../controllers/widgets.server.controller'),
  users = require(path.resolve('./modules/users/server/controllers/users/users.authorization.server.controller'));

module.exports = function(app) {
  // Widgets Routes
  app.route('/api/widgets').all(widgetsPolicy.isAllowed)
    .get(widgets.list)
    .post(widgets.create);

  app.route('/api/widgets/:widgetId').all(widgetsPolicy.isAllowed)
    .get(widgets.read)
    .put(widgets.update)
    .delete(widgets.delete);


  app.route('/api/widgetByUser/:userId').all(widgetsPolicy.isAllowed).get(widgets.widgetByUser);

  app.route('/api/widget_image/:widgetId').get(widgets.getWidgetImage);

  app.route('/api/widgetsByUser/:userId').all(widgetsPolicy.isAllowed).get(widgets.widgetsByUser);

  app.route('/api/widgetByUniqueCode/:uniqueCode').get(widgets.widgetByUniqueCode);

  app.route('/api/widgetByConversationCode/:conversationCode').get(widgets.widgetByConversationCode);

  app.route('/api/widgetByWidgetId/:widgetId').get(widgets.widgetByWidgetId);

  app.route('/api/createMultipleWidget').post(widgets.createMultiple);

  app.route('/api/get_unique_code').post(widgets.unique_code);
  app.route('/api/savePreview').post(widgets.savePreview);
  app.route('/api/getPreviewById').post(widgets.getPreviewById)
  app.route('/api/updatePreview/:previewId').post(widgets.updatePreview)

  app.route('/api/widgetsByOrganization/:organizationId').get(widgets.widgetsByOrgId);

  // Finish by binding the Widget middleware
  app.param('userId', users.userByID);
  app.param('widgetId', widgets.widgetByID);
  app.param('organizationId', widgets.organizationByID);
  app.param('previewId',widgets.checkPreview)
};
