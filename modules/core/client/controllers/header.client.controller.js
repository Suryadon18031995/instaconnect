(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'Authentication', 'menuService', '$http', '$stateParams'];

  function HeaderController($scope, $state, Authentication, menuService, $http, $stateParams) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    vm.signOutUser = function() {
      $http.get('/api/auth/signout').then(function(response) {
        Authentication.user = null;
        $state.transitionTo('home', $stateParams, { reload: true, inherit: false, notify: true });
      }, function(error) {
        console.info(error);
      });
    };
    
    vm.goto_establishment = function ()
    {
      $state.transitionTo('organizations.list', $stateParams, { reload: true, inherit: false, notify: true });
    }

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());
