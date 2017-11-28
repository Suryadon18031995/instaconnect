(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangePasswordController', ChangePasswordController);

  ChangePasswordController.$inject = ['$scope', '$http', 'Authentication', 'UsersService', 'PasswordValidator', 'Notification', '$window', 'Upload', 'FirebaseService', '$firebaseStorage'];

  function ChangePasswordController($scope, $http, Authentication, UsersService, PasswordValidator, Notification, $window, Upload, FirebaseService, $firebaseStorage) {
    var vm = this;
    var _this = this;

    vm.user = Authentication.user;
    vm.changeUserPassword = changeUserPassword;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;

    function init() {
      FirebaseService.getStorageRef(_this.user, function (ref) {
        _this.ref = ref;
        _this.storageObject = $firebaseStorage(_this.ref.child('images').child('profile').child(_this.user._id));
      });
      vm.disableUsernameField = vm.user.userName !== '' && vm.user.userName !== undefined && vm.user.userName !== null;

      if (vm.user.profileImageURL.startsWith('modules')) {
        vm.profilePicUrl = $window.location.origin + '/' + vm.user.profileImageURL;
      } else {
        vm.profilePicUrl = vm.user.profileImageURL;
      }
    }

    // Change user password
    function changeUserPassword(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.passwordForm');

        return false;
      }

      UsersService.changePassword(vm.passwordDetails)
        .then(onChangePasswordSuccess)
        .catch(onChangePasswordError);
    }

    function onChangePasswordSuccess(response) {
      // If successful show success message and clear form
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Password Changed Successfully' });
      vm.passwordDetails = null;
    }

    function onChangePasswordError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Password change failed!' });
    }

    vm.updateUsername = function () {
      var user = new UsersService(vm.user);

      if (_this.picFile || _this.defaultImageInBase64) {
        _this.uploadFile(function (downloadURL) {
          user.profileImageURL = downloadURL;
          user.$update(function (response) {
            Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Profile updated successfully!' });
            Authentication.user = response;
            vm.user = response;
            vm.disableUsernameField = true;
          }, function (response) {
            Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Edit profile failed!' });
          });
        });
      } else {
        user.$update(function (response) {
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Profile updated successfully!' });
          Authentication.user = response;
          vm.user = response;
          vm.disableUsernameField = true;
        }, function (response) {
          Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Edit profile failed!' });
        });
      }
    };

    _this.uploadFile = function (callback) {
      if (_this.picFile === null && _this.defaultImageInBase64) {
        var uploadTask = _this.storageObject.$putString(_this.defaultImageInBase64, 'base64', { contentType: 'image/png' });
        uploadTask.$complete(function (snapshot) {
          callback(snapshot.downloadURL);
        });
      } else {
        Upload.base64DataUrl(_this.picFile).then(function (base64Urls) {
          var base64String = base64Urls.split(',')[1].toString();
          var uploadTask = _this.storageObject.$putString(base64String, 'base64', { contentType: _this.picFile.type });

          uploadTask.$complete(function (snapshot) {
            callback(snapshot.downloadURL);
          });
        });
      }

    };

    _this.restoreDefault = function () {
      _this.picFile = $window.location.origin + '/modules/users/client/img/profile/default.png';
      _this.fileSelected = $window.location.origin + '/modules/users/client/img/profile/default.png';
      var xhr = new XMLHttpRequest();
      xhr.open('GET', _this.picFile, true);
      xhr.responseType = 'blob';
      xhr.onload = function (e) {
        var reader = new FileReader();
        reader.onload = function (event) {
          var res = event.target.result;
          var encoded = res.replace(/^data:image\/(png|jpg);base64,/, '');
          _this.defaultImageInBase64 = encoded;
        };
        var file = this.response;
        reader.readAsDataURL(file);
      };
      xhr.send();
    };

    init();
  }
}());
