(function () {
  'use strict';

  angular
    .module('Waiter')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });
    
    $stateProvider.state('server', {
        abstract: true,
        url: '/server',
        template: '<ui-view/>'
      })
      .state('server.list', {
        url: '',
        templateUrl: '/modules/waiter/client/views/server.client.view.html',
        controller: 'serverController',
        controllerAs: 'serverController'
      })
      .state('server.add', {
        url: '/add',
        templateUrl: '/modules/waiter/client/views/addServer.client.view.html',
        controller: 'createServerController',
        controllerAs: 'createServerController'
      })
      .state('server.edit', {
        url: '/edit/:serverId',
        templateUrl: '/modules/waiter/client/views/addServer.client.view.html',
        controller: 'createServerController',
        controllerAs: 'createServerController'
      })      
      
  }
}());
