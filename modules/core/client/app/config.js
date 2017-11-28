(function (window) {
  'use strict';

  var applicationModuleName = 'mean';

  var service = {
    applicationEnvironment: window.env,
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ngFileUpload', 'ui-notification', 'restangular', 'firebase', 'LocalStorageModule', 'angularMoment', 'colorpicker.module', 'ngclipboard', 'base64', 'angularSpinner','ngMessages', 'google.places','selectize','ngMask','FBAngular', 'ui.mask'],
    registerModule: registerModule
  };

  window.ApplicationConfiguration = service;

  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []).constant('_', window._);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);

    angular.module(applicationModuleName).run(function ($rootScope, $state, Authentication, $window, $stateParams) {
      var $ = angular.element;
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (toState.name !== 'home') {
          $rootScope.noContainer = false;
        }
      });
    });
  }

  // Angular-ui-notification configuration
  angular.module('ui-notification').config(function(NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 2000,
      startTop: 20,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'right',
      positionY: 'bottom'
    });
  });
}(window));
