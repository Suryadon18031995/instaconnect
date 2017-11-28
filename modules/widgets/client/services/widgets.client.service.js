'use strict';

angular.module('widgets').service('WidgetsService', ['Restangular',
  function (Restangular) {
    var _this = this;

    _this.getWidgetByUser = function(userId) {
      return Restangular.all('api/widgetByUser').one(userId).get();
    };
    _this.createWidget = function(widgets) {
      return Restangular.all('api/widgets').post(widgets);
    };

    _this.updateWidget = function(widgetId, widget) {
      return Restangular.one('api/widgets', widgetId).customPUT(widget);
    };

    _this.getWidgetsByUser = function(userId) {
      return Restangular.all('api/widgetsByUser').one(userId).get();
    };

    _this.getWidgetById = function(widgetId) {
      return Restangular.all('api/widgets').one(widgetId).get();
    };

    _this.deleteWidget = function(widgetId) {
      return Restangular.one('api/widgets', widgetId).remove();
    };

    _this.widgetByUniqueCode = function(uniqueCode) {
      return Restangular.all('api/widgetByUniqueCode').one(uniqueCode).get();
    };

    _this.widgetByConversationCode = function(conversationCode) {
      return Restangular.all('api/widgetByConversationCode').one(conversationCode).get();
    };


    _this.create_multiple_widget = function(multiple) {
      return Restangular.all('api/createMultipleWidget').post(multiple);
    };
    _this.getUniqueCode = function() {
      return Restangular.all('api/get_unique_code').post();
    };
    _this.getEstablishment = function(userId) {
      return Restangular.all('api/getEstablishmentInfo').post({_id:userId});
    };
    _this.savePreview = function(preview) {
      return Restangular.all('api/savePreview').post(preview);
    };
    _this.updatePreview = function(preview) {
      return Restangular.all('api/updatePreview/'+preview._id).post(preview)
    };
    _this.getPreviewById = function(id){
      return Restangular.all('api/getPreviewById').post(id);
    }

  }
]);
