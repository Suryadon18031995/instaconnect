(function () {
  'use strict';

  // Setting up route
  angular
    .module('invitations')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Invitations state routing
    $stateProvider
      .state('invitations', {
        url: '/invitations',
        templateUrl: 'modules/invitations/client/views/invitations.client.view.html',
        controller: 'InvitationsController',
        controllerAs: 'vm'
      })
      .state('invitations.accepted', {
        url: '/accepted',
        templateUrl: 'modules/invitations/client/views/invitations.client.view.html',
        data: {
          pageTitle: 'Invitation Already Accepted'
        }
      });
  }
}());
