(function () {
  'use strict';

  angular
    .module('Waiter')
    .controller('createServerController', createServerController);

  createServerController.$inject = ['$scope', '$http', '$state', '$stateParams', '$window', 'Authentication', 'Upload', '$timeout', 'Notification', '$uibModal', 'FirebaseService', '$firebaseStorage', 'InvitationService', '$base64', 'Restangular', '$interval', '$log', 'waiterService'];

  function createServerController($scope, $http, $state, $stateParams, $window, Authentication, Upload, $timeout, Notification, $uibModal, FirebaseService, $firebaseStorage, InvitationService, $base64, Restangular, $interval, $log, waiterService) {
    var _this = this;
    _this.authentication = Authentication;
    _this.user = _this.authentication.user;
    _this.server = {};
    var log = $log.log

    _this.addServerInit = function () {
      $('li#servers').addClass('active');
      if ($stateParams.serverId) {
        _this.server = $stateParams.serverId
        waiterService.getWaiterById({owner_id: _this.user._id, _id: $stateParams.serverId }).then(function (waiter) {
            $scope.editMode = true;
            _this.server = waiter;
            _this.server.name = _this.server.displayName;
        }, function (err) {
             Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i>' + err.data.message, positionY: 'bottom', positionX: 'center' });

        });
      }


    }

    _this.addServer = function (valid, data) {
      // _this.inviteUser();
      $scope.submitted = true;
      
      // else {
        if (valid) {
            if ($stateParams.serverId) {
              $scope.show_loading = true;
              _this.updateWaiter(_this.server)
            }else {
              $scope.show_loading = true;
            var data = {
              userId : _this.user._id,
              name: _this.server.name,
              email: _this.server.email,
              phoneNumber: _this.server.phoneNumber 
            };

            waiterService.addWaiter(data).then(function (response) {
                _this.server = response;
                $scope.show_loading = false;
                Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Staff Added successfully', positionY: 'bottom', positionX: 'center' });
                $state.transitionTo('server.list', $stateParams, { reload: true, inherit: false, notify: true });
              }, function(err) {
                $scope.show_loading = false;
                Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i>' + err.data.message, positionY: 'bottom', positionX: 'center' });
            })
          }
        }
        // else {
        //   log("Form is invalid")
        // }
    }
    _this.updateWaiter = function () {
      waiterService.updateWaiter(_this.server).then(function (response) {
        $state.transitionTo('server.list', $stateParams, { reload: true, inherit: false, notify: true });
        $scope.show_loading = false;
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Staff updated successfully', positionY: 'bottom', positionX: 'center' });
        $scope.submitted = false;
        $stateParams.serverId = null;
      }, function (err) {
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to update staff', positionY: 'bottom', positionX: 'center' });
        $scope.submitted = false;
      })

    }

    // _this.inviteUser = function () {
    //   var invitationDetails = {
    //     name: _this.memberName,
    //     email: _this.memberEmail,
    //     number: _this.memberNumber
    //   };

    //   InvitationService.inviteUser(invitationDetails).then(function (response) {
        
    //     if (response.message) {
    //       Notification.error({ message: response.message, positionY: 'bottom', positionX: 'center' });
    //     } else {
    //       Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Invitation sent successfully!', positionY: 'bottom', positionX: 'center' });
    //       // _this.getInvitations();
    //     }
    //   }, function (error) {
    //     console.info(error);
    //     Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to invited member. Please try again!', positionY: 'bottom', positionX: 'center' });
    //   });
    // };
  }
}());
