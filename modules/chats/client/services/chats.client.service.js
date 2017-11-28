'use strict';

angular.module('chats').service('ChatsService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.sendOfflineMessage = function(offlineData) {
      return Restangular.all('api/chats/offline').post(offlineData);
    };
  }
]);
