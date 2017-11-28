'use strict';

module.exports = function (app) {
  // Waiter Routes
  var path = require('path');
  var waiter = require('../controller/waiter.server');
  var widgets = require(path.resolve('./modules/widgets/server/controllers/widgets.server.controller'));

  app.route('/api/getWaiterList/:_id').get(waiter.getWaiters);
  app.route('/api/waiter/:waiter_id/:organization').delete(waiter.deleteWaiter);
  app.route('/api/waiter').post(waiter.addWaiter);
  app.route('/api/waiter/:waiter_id')
  .put(waiter.updateWaiter) 
  .get(waiter.getWaiterById);
  app.route('/api/updateWaiterWidgets/:waiter_id').put(waiter.updateWaiterWidgets);
  app.route('/api/deleteWaiterWidgets/:waiter_id').put(waiter.deleteWaiterWidgets);
  app.route('/api/getWidgetListById/:user_id').get(waiter.findWidgetsById);
  app.route('/api/findUnAssingedWidgets/:user_id').get(waiter.findUnAssingedWidgets);

   // app.route('/api/update_establishment/:es_id').post(establishment.update_establishment)

  // Finish by binding the user middleware
  app.param('waiter_id', waiter.checkWaiter);
  app.param('widgetId', widgets.widgetByID);

};