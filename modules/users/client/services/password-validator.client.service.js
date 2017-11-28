(function () {
  'use strict';

  // PasswordValidator service used for testing the password strength
  angular
    .module('users.services')
    .factory('PasswordValidator', PasswordValidator);

  PasswordValidator.$inject = ['$window'];

  function PasswordValidator($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    var service = {
      getResult: getResult,
      getPopoverMsg: getPopoverMsg
    };

    return service;

    function getResult(password) {
      var result = {
        errors: [],
        failedTests: [],
        passedTests: [],
        requiredTestErrors: [],
        optionalTestErrors: [],
        isPassphrase: false,
        strong: true,
        optionalTestsPassed: 0
      };

      if (password.length > owaspPasswordStrengthTest.configs.minLength && password.length < owaspPasswordStrengthTest.configs.maxLength) {
        return result;
      } else if (password.length < owaspPasswordStrengthTest.configs.minLength) {
        result.errors.push('The password must be at least ' + owaspPasswordStrengthTest.configs.minLength + ' characters long.');
      } else if (password.length > owaspPasswordStrengthTest.configs.maxLength) {
        result.errors.push('The password must be fewer than ' + owaspPasswordStrengthTest.configs.maxLength + ' characters.');
      }
      // var result = owaspPasswordStrengthTest.test(password);
      return result;
    }

    function getPopoverMsg() {
      var popoverMsg = 'Please enter a passphrase or password with ' + owaspPasswordStrengthTest.configs.minLength + ' or more characters, numbers, lowercase, uppercase, and special characters.';

      return popoverMsg;
    }
  }

}());
