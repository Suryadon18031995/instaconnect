'use strict';

angular.module('invitations').service('InvitationService', ['Restangular',
  function (Restangular) {
    var _this = this;

    _this.inviteUser = function(invitationDetails) {
      return Restangular.all('api/invitations').post(invitationDetails);
    };

    _this.getInvites = function() {
      return Restangular.all('api/invitations').getList();
    };
  }
]);
