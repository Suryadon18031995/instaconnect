'use strict';

angular.module('organizations').service('OrganizationService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.saveOrganizationDetails = function(organizationDetails) {
      return Restangular.all('api/organizations').post(organizationDetails);
    };

    _this.getOrganizationDetails = function(organizationId) {
      return Restangular.all('api/organizations').one(organizationId).get();
    };

    _this.getOrganizationMembers = function(organizationId) {
      return Restangular.one('api/organizations', organizationId).getList('members');
    };

    _this.updateOrganization = function(organizationId, organizationDetails) {
      return Restangular.one('api/organizations', organizationId).customPUT(organizationDetails);
    };

    _this.deactivateUser = function(organizationDetails) {
      return Restangular.all('api/deactivateUser').post(organizationDetails);
    };
  }
]);
