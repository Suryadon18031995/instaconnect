(function () {
  'use strict';

  angular
    .module('qrCode')
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
    
    $stateProvider.state('qrcode', {
        abstract: true,
        url: '',
        template: '<ui-view/>'
      })
      .state('qrcode.scan', {
        url: '',
        templateUrl: '/modules/qrCode/client/views/qrCode.client.view.html',
        controller: 'qrCodeController',
        controllerAs: 'qrCodeController'
      })
      .state('qrcode.list', {
        url: '/requests/:chatUrl',
        templateUrl: '/modules/qrCode/client/views/qrCode.client.requestList.html',
        controller: 'requestListController',
        controllerAs: 'requestListController'
      })           
  }
}());
