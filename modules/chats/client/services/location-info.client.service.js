'use strict';

angular.module('chats').service('LocationInfoService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.saveLocationInfo = function(locationInfo) {
      return Restangular.all('api/saveLocationInfo').post(locationInfo);
    };
  }
]);
