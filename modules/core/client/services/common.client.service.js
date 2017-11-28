
'use strict';
angular.module('core').service('CommonService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.isMobile = function() {
        var isMob = /Android/i.test(navigator.userAgent);
        return isMob;
    };
  }
]);


