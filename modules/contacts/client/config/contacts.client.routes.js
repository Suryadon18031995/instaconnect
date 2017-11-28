(function () {
  'use strict';

  // Setting up route
  angular
    .module('contacts')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Contacts state routing
    $stateProvider
      .state('contacts', {
        url: '/contacts',
        templateUrl: 'modules/contacts/client/views/contacts.client.view.html',
        controller: 'ContactsController',
        controllerAs: 'contactsController'
      });
  }
}());
