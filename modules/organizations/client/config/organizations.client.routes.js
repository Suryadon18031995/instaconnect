(function () {
  'use strict';

  angular
    .module('organizations')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('organizations', {
        abstract: true,
        url: '/establishment',
        template: '<ui-view/>'
      })
      .state('organizations.list', {
        url: '',
        templateUrl: 'modules/organizations/client/views/organizations.client.view.html',
        controller: 'OrganizationsController',
        controllerAs: 'organizationsController',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Organizations'
        }
      });
  }
}());
