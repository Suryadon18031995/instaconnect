(function() {
    'use strict';

    angular
        .module('qrCode')
        .controller('requestListController', requestListController);

    requestListController.$inject = ['$scope', '$http', '$state', '$stateParams', '$window', 'Authentication', 'Upload', '$timeout', 'Notification', '$uibModal', 'FirebaseService', '$firebaseStorage', 'InvitationService', '$base64', 'Restangular', '$interval', '$log', '$rootScope', 'qrCodeService', 'WidgetsService'];

    function requestListController($scope, $http, $state, $stateParams, $window, Authentication, Upload, $timeout, Notification, $uibModal, FirebaseService, $firebaseStorage, InvitationService, $base64, Restangular, $interval, $log, $rootScope, qrCodeService, WidgetsService) {
        var _this = this;
        _this.authentication = Authentication;
        _this.user = _this.authentication.user;
        _this.showScanning = false;
        var log = $log.log;
        log("RequestListController. . .", $stateParams.chatUrl)

        // if(!_this.user) {
        //         $state.transitionTo('home', $stateParams, {
        //         reload: true,
        //         inherit: false,
        //         notify: true
        //         });
        //     }
        // Notification.success({
        //                     message: '<i class="glyphicon glyphicon-ok"></i> Request deleted successfully',
        //                     positionY: 'bottom',
        //                     positionX: 'center'
        //                 });
        
        
       
        _this.getRequestList = function () {
            qrCodeService.getRequestListByUserId(_this.user._id).then(function(requestList){
                _this.requestList = requestList;
                log("THis is the requestList", _this.requestList);

            })
        }
        _this.gotoChat = function() {
            WidgetsService.widgetByConversationCode(_this.conversationCode).then(function (response) {
        if (response === undefined) {
          Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Invalid Conversation Code Entered, Please Enter Valid Conversation Code', positionY: 'bottom', positionX: 'center', delay: 5000 });
        } else {
          if (response.assignedTo != undefined){
            var assignedTo = response.assignedTo;
            var chatUrl = response.assignedTo.waiter_id ? $window.location.origin + '/' + response.assignedTo.waiter_id + '/talk?via=web&wcode=' + response.uniqueCode :  _this.chatUrl = $window.location.origin + '/' + response.assignedTo.name + '/talk?via=web&wcode=' + response.uniqueCode; 
            $window.location.href = chatUrl;
          } else {
              Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Server not assinged', positionY: 'bottom', positionX: 'center', delay: 5000 });
          } 
        }
      }, function (err) {
        console.info(err);
      });
        }
    };
}());