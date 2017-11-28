(function () {
  'use strict';

  // Focus the element on page load
  // Unless the user is on a small device, because this could obscure the page with a keyboard

  angular.module('widgets')
    .directive('prism', prism);

  prism.$inject = ['$timeout', '$window'];

  function prism($timeout, $window) {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element, attrs) {
      element.ready(function() {
        $timeout(function() {
          Prism.highlightElement(element[0]);
        }, 1000);
      });
    }
  }
}());
