'use strict';

angular.module('frequentRequest').service('FrequentRequestService', ['Restangular',
  function (Restangular) {
    var _this = this;

   _this.addFrequentRequest = function (data) {
      return Restangular.all('api/addFrequentRequest').post(data);
   };
   
   _this.getFrequentRequests = function (id) {
      return Restangular.all('api/getFrequentRequests').all(id).getList();
   }; 

   _this.getFrequentRequestsByOrgId = function (id) {
      return Restangular.all('api/getFrequentRequestsByOrgId').all(id).getList();
   }; 

   _this.setFrequentRequestSelected = function(id,frequentRequest) {
      return Restangular.one('api/frequentRequests',id).customPUT(frequentRequest);
   }

   _this.deleteFrequentRequest = function(id) {
      return Restangular.all('api/frequentRequests').one(id).remove();
   }
   _this.updateFrequentRequest = function (frequentRequest) {
      return Restangular.one('api/frequentRequests',frequentRequest._id).customPUT(frequentRequest);
   };

   _this.getStaffRequestEntityByRequestId = function (id) {
	      return Restangular.all('api/getStaffRequestEntity').all(id).getList();
	   };
  }
]);
