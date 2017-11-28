(function() {
  'use strict';

  angular
    .module('invitations')
    .controller('InvitationsController', InvitationsController);

  InvitationsController.$inject = ['$scope'];

  function InvitationsController($scope) {
    var vm = this;

    // Invitations controller logic
    // ...

    init();

    function init() {
    }
  }
}());
