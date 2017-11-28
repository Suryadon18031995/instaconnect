(function () {
  'use strict';

  // Organizations controller
  angular
    .module('organizations')
    .controller('OrganizationsController', OrganizationsController);

  OrganizationsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'Upload', '$timeout', 'OrganizationService', 'Notification', '$uibModal', 'FirebaseService', '$firebaseStorage', 'InvitationService', '$stateParams', '$rootScope'];

  function OrganizationsController($scope, $state, $window, Authentication, Upload, $timeout, OrganizationService, Notification, $uibModal, FirebaseService, $firebaseStorage, InvitationService, $stateParams, $rootScope) {
    var _this = this;

    _this.organization = {};
    _this.organizationName = '';
    _this.error = null;
    _this.members = [];
    _this.redirectedUserId = '-1';
    _this.address = '';
    _this.isUpdate = false;

    function init() {
      FirebaseService.getStorageRef(Authentication.user, function (ref) {
        _this.ref = ref;
      });
      FirebaseService.saveUserInDB(Authentication.user, 'offline');
      if (Authentication.user.organization) {
        $rootScope.hidenavbar = false;
        var organizationId = Authentication.user.organization;
        _this.getOrganizationDetails(organizationId);
        _this.getOrganizationMembers(organizationId);
        _this.getInvitations();
      } else {
        $rootScope.hidenavbar = true;
        _this.organization = null;
        _this.logo = null;
        _this.organizationName = null;
      }
    }

    _this.getOrganizationDetails = function(organizationId) {
      OrganizationService.getOrganizationDetails(organizationId).then(function(response) {
        _this.organization = response;
        _this.organizationName = _this.organization.organizationName;
        _this.logo = _this.organization.logo;
        _this.address = _this.organization.address;
        _this.isUpdate = true;
      }, function(errorResponse) {
        console.log(errorResponse);
      });
    };

    _this.getOrganizationMembers = function(organizationId) {
      OrganizationService.getOrganizationMembers(organizationId).then(function(response) {
        _this.members = response;
      }, function(errorResponse) {
        console.log(errorResponse);
      });
    };

    _this.createOrganization = function() {
      if(!_this.isUpdate){
        var addressTmp = _this.address.formatted_address != undefined ? _this.address.formatted_address : _this.address;
        var data = {
          organizationName: _this.organizationName,
          address: addressTmp
          // newOrgLogo: _this.picFile
        };
        OrganizationService.saveOrganizationDetails(data).then(_this.organizationSuccess, _this.organizationFailure); 
      }else {
        // setting values to update name and address
        _this.organization.organizationName = _this.organizationName;
        _this.organization.address = _this.address.formatted_address != undefined ? _this.address.formatted_address : _this.address;
        console.log(_this.organization);
        OrganizationService.updateOrganization(_this.organization._id, _this.organization).then(_this.updateSuccessResponse,_this.updateFailureResponse);
      }
    };

    _this.editOrganization = function() {
      _this.isDisabled = false;
    };

    _this.cancelEdit = function() {
      _this.isDisabled = true;
    };

    _this.updateOrganization = function() {
      OrganizationService.updateOrganization(_this.organization._id, _this.organization).then(function(response) {
        _this.organization = response;
        if(_this.isUpdate){
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Establishment updated successfully!', positionY: 'bottom', positionX: 'center' });
        }else {
          $rootScope.hidenavbar = false;
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Establishment created successfully!', positionY: 'bottom', positionX: 'center' });
          $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
        }
      }, function(failure) {
        console.error(failure);
      });
    };

    _this.organizationSuccess = function(response) {
      _this.organization = response;
      Authentication.user.organization = _this.organization._id;
      if (_this.picFile) {
        _this.uploadFile(_this.organization, function (downloadURL) {
          _this.widget.imageUrl = downloadURL;
        });
      }else {
        if (!_this.isUpdate) {
          $rootScope.hidenavbar = false;
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Establishment created successfully!', positionY: 'bottom', positionX: 'center' });
          $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
        }
      }
    };

    _this.updateSuccessResponse = function(response) {
      _this.organization = response;
      if (_this.picFile) {
        _this.uploadFile(_this.organization, function (downloadURL) {
          _this.widget.imageUrl = downloadURL;
        });
      }else {
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Establishment updated successfully!', positionY: 'bottom', positionX: 'center' });
      }
    };

    _this.updateFailureResponse = function(failure) {
      console.error(failure);
    };

    _this.uploadFile = function(organization) {
      _this.storageObject = $firebaseStorage(_this.ref.child('images').child('organizations').child(organization._id));
      Upload.base64DataUrl(_this.picFile).then(function (base64Urls) {
        var base64String = base64Urls.split(',')[1].toString();
        var uploadTask = _this.storageObject.$putString(base64String, 'base64', { contentType: _this.picFile.type });

        uploadTask.$complete(function (snapshot) {
          _this.organization.logo = snapshot.downloadURL;
          _this.updateOrganization();
        });
      });
    };

    _this.setImage = function(){
      Upload.base64DataUrl(_this.picFile).then(function (base64Urls) {
        if (base64Urls)
          _this.logo = base64Urls;
      });
    };

    _this.organizationFailure = function(errorResponse) {
      console.info(errorResponse);
    };

    _this.showInviteModal = function() {
      _this.inviteModal = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-bottom',
        ariaDescribedBy: 'modal-body-bottom',
        templateUrl: 'stackedModal.html',
        size: 'md'
      });
    };

    _this.closeModal = function() {
      _this.inviteModal.dismiss('cancel');
    };

    _this.inviteUser = function() {
      var invitationDetails = {
        name: _this.memberName,
        email: _this.memberEmail
      };

      InvitationService.inviteUser(invitationDetails).then(function(response) {
        if (response.message) {
          Notification.error({ message: response.message, positionY: 'bottom', positionX: 'center' });
        } else {
          angular.element('#send-invite-modal').modal('hide');
          _this.memberName = '';
          _this.memberEmail = '';
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Invitation sent successfully!', positionY: 'bottom', positionX: 'center' });
          _this.getInvitations();
        }
      }, function(error) {
        console.info(error);
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to invited member. Please try again!', positionY: 'bottom', positionX: 'center' });
      });
    };

    _this.getInvitations = function() {
      InvitationService.getInvites().then(function(response) {
        _this.invitations = response;
      }, function(error) {
        console.info(error);
      });
    };

    _this.deactivateUser = function () {
      var data = {
        userId: _this.selectedUser,
        redirectedUserId: _this.redirectedUserId
      };

      OrganizationService.deactivateUser(data).then(function(response) {
        angular.element('#deactivate-user-invite-modal').modal('hide');
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> User Deactivated Successfully!', positionY: 'bottom', positionX: 'center' });
        _this.redirectedUserId = '-1';
        _this.selectedUser = undefined;
        _this.getOrganizationMembers(_this.organization._id);
      }, function(error) {
        console.info(error);
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to deactivate user. Please try again!', positionY: 'bottom', positionX: 'center' });
      });
    };

    _this.selectUser = function(user) {
      _this.selectedUser = user.id;
    };

    init();
  }
}());
