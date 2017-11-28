'use strict';

angular.module('campaigns').service('CampaignsService', ['Restangular',
  function (Restangular) {
    var _this = this;

    _this.createCampaign = function(campaigns) {
      return Restangular.all('api/campaigns').post(campaigns);
    };

    _this.getCampaigns = function() {
      return Restangular.all('api/campaigns').getList();
    };
  }
]);
