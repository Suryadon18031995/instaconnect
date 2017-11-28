(function () {
  'use strict';

  // Widgets controller
  angular
    .module('conversations')
    .controller('ConversationsController', ConversationsController);

  ConversationsController.$inject = ['$scope', '$rootScope'];

  function ConversationsController($scope, $rootScope) {
    var _this = this;

    function init() {
    }

    init();
  }
}());
