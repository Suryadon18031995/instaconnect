(function () {
  'use strict';

  angular.module('campaigns')
    .directive('csSelect', pageTitle);

  pageTitle.$inject = ['$rootScope', '$interpolate', '$state'];

  function pageTitle($rootScope, $interpolate, $state) {
    var directive = {
      template: '<input type="checkbox"/>',
      scope: {
        row: '=csSelect'
      },
      link: link
    };

    return directive;

    function link(scope, element, attr, ctrl) {
      element.bind('change', function (evt) {
        scope.$apply(function () {
          ctrl.select(scope.row, 'single');
        });
      });

      scope.$watch('row.isSelected', function (newValue, oldValue) {
        if (newValue === true) {
          element.parent().addClass('st-selected');
        } else {
          element.parent().removeClass('st-selected');
        }
      });
    }
  }
}());
