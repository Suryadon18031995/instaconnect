(function () {
  'use strict';

  angular.module('chats')
    .directive('scrollBottom', pageTitle);

  pageTitle.$inject = ['$rootScope', '$interpolate', '$state'];

  function pageTitle($rootScope, $interpolate, $state) {
    var directive = {
      scope: {
        scrollBottom: '='
      },
      link: link
    };

    return directive;

    function link(scope, element) {
      scope.$watchCollection('scrollBottom', function (newValue) {
        if (newValue) {
          $(element).animate({ scrollTop: $(element[0]).prop('scrollHeight') }, 1000);
        }
      });
    }
  }
}());
