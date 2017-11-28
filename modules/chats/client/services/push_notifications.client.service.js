'use strict';

angular.module('chats').service('PushNotificationService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.sendNotification = function(notification) {
      return Restangular.all('api/notifications').post(notification);
    };
  }
]);
