(function () {
  'use strict';

  // Setting up route
  angular
    .module('chats.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Chats state routing
    $stateProvider
      .state('chats', {
        url: '/:userId',
        abstract: true,
        template: '<ui-view/>'
      })
      .state('chats.user', {
        url: '/talk',
        templateUrl: '/modules/chats/client/views/chats.client.view.html',
        controller: 'ChatsController',
        controllerAs: 'chatsController',
        data: {
          pageTitle: 'Chat with {{userResolve.user.displayName}}'
        },
        resolve: {
          userResolve: getUser
        }
      });

    getUser.$inject = ['$stateParams', 'UsersService'];

    function getUser($stateParams, UsersService) {
      return UsersService.findByUsername({
        userId: $stateParams.userId
      }).$promise;
    }
  }
}());
