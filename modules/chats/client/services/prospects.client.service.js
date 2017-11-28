'use strict';

angular.module('chats').service('ProspectsService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.saveProspects = function(prospects) {
      return Restangular.all('api/prospects').post(prospects);
    };

    _this.updateProspects = function(prospectsId, prospects) {
      return Restangular.one('api/prospects', prospectsId).customPUT(prospects);
    };

    _this.saveUserLocation = function(userLocation) {
      return Restangular.all('api/saveLocationInfo').post(userLocation);
    };

  }
]);
