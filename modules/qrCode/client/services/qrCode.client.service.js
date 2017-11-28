'use strict';

angular.module('qrCode').service('qrCodeService', ['Restangular',
  function (Restangular) {
    var _this = this;
    
   _this.getRequestListByUserId = function (id) {
    return Restangular.all('api/getFrequentRequests').all(id).getList();
   }; 

  }
]);
