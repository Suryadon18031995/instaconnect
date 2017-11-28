(function () {
  'use strict';

  angular
    .module('conversations')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('conversations', {
        abstract: true,
        url: '/conversations',
        template: '<ui-view/>'
      })
      .state('conversations.list', {
        url: '',
        templateUrl: 'modules/conversations/client/views/conversations.client.view.html',
        controller: 'ConversationsController',
        controllerAs: 'conversationsController',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Conversations'
        }
      });
  }
}());

