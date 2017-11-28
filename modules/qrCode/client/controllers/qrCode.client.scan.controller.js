(function() {
  'use strict';
  angular.module('qrCode').controller('qrCodeController', qrCodeController);
  qrCodeController.$inject = ['$http', '$state', '$stateParams', '$window', 'Authentication', 'Upload', '$scope', '$timeout', 'Notification', '$uibModal', 'FirebaseService', '$firebaseStorage', 'InvitationService', '$base64', 'Restangular', '$interval', '$log', '$rootScope', 'qrCodeService', 'WidgetsService', 'ProspectsService', 'localStorageService'];
  function qrCodeController($http, $state, $stateParams, $window, Authentication, Upload, $scope, $timeout, Notification, $uibModal, FirebaseService, $firebaseStorage, InvitationService, $base64, Restangular, $interval, $log, $rootScope, qrCodeService, WidgetsService, ProspectsService, localStorageService) {
    var _this = this;
    _this.authentication = Authentication;
    _this.user = _this.authentication.user;
    var log = $log.log;
    $scope.cameraRequested = false;
    _this.prospects = {};

    $rootScope.$on('startScan', function(ev, data) {
      if (data) {
        _this.start();
      }
    });

    _this.start = function() {
      $timeout(function() {
        $scope.cameraRequested = true;
        // var homeElement = angular.element(document.querySelector('#homeContent'));
        // homeElement.addClass('ng-hide');
        // var cameraElement = angular.element(document.querySelector('#cameraContent'));
        // cameraElement.addClass('ng-show');
        // $scope.cameraIsOn = true;
      },0);
    };
    $scope.processURLfromQR = function (url) {
      _this.conversationCode = url.split('?wCode=')[1];
      $scope.cameraRequested = false;
      $rootScope.$emit('stopScan', true);
      _this.joinChatByCode();
    };
    _this.joinChatByCode = function (conversationCode) {
      WidgetsService.widgetByConversationCode(_this.conversationCode).then(function (response) {
        if (response === undefined) {
          Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Invalid Conversation Code Entered, Please Enter Valid Conversation Code', positionY: 'bottom', positionX: 'center', delay: 5000 });
        } else {
          if (response.assignedTo !== undefined) {
            var waiter = response.assignedTo;
            var chatUrl = waiter._id ? $window.location.origin + '/' + waiter._id + '/talk?via=web&wcode=' + response.uniqueCode  : _this.chatUrl = $window.location.origin + '/' + waiter.displayName + '/talk?via=web&wcode=' + response.uniqueCode;
            _this.createProspects(waiter._id,chatUrl);
          } else {
            Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Server not assigned', positionY: 'bottom', positionX: 'center', delay: 5000 });
          }
        }
      }, function (err) {
        console.info(err);
      });
    };

    _this.createProspects = function (waiterId, chatUrl) {
      _this.prospects.userId = waiterId;
      ProspectsService.saveProspects(_this.prospects).then(function (response) {
        _this.prospects = response;
        localStorageService.set('prospects', _this.prospects);
        localStorageService.set('showChat', false);

        $window.location.href = chatUrl;
      }, function (errorResponse) {
        console.log(errorResponse);
      });
    };

    $scope.closeScanning = function() {
      $scope.cameraRequested = !$scope.cameraRequested;
      $scope.$emit('stopScan', true);
    };
    $scope.onError = function (err) {
      alert(err);
    };

    $scope.$on('cameraErr', function(ev, data) {
      if (data) {
        $scope.cameraRequested = false;
      }
    });
    // $scope.$watch('cameraRequested', function(old, newValue) {
    //   if (old) {
    //     alert(old);
    //   }
    // });

  }
}());