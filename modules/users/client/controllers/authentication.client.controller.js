(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', '$rootScope', 'UsersService', '$location', '$window', 'Authentication', 'PasswordValidator', 'Notification', '$stateParams', 'localStorageService', 'FirebaseService'];

  function AuthenticationController($scope, $state, $rootScope, UsersService, $location, $window, Authentication, PasswordValidator, Notification, $stateParams, localStorageService, FirebaseService) {
    var vm = this;
    vm.showCamera = false;
    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;
    vm.setReadOnly = false;
    vm.usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;

    // Get an eventual error defined in the URL query string:
    if ($location.search().err) {
      Notification.error({ message: $location.search().err });
    }

    $rootScope.$on('startScan', function(ev, data) {
        if(data) {
            vm.showCamera = true;
        }
    });

    $rootScope.$on('stopScan', function(ev, data){
        if(data) {
          vm.showCamera = false;
        }
    });

    var _init = function(){
      vm.credentials = {};
      if($location.search().userId !== undefined){
        $rootScope.hidenavbar = true;
        var userId = $location.search().userId;
        vm.getUser(userId);
        vm.setReadOnly = true;
      }else {
        $rootScope.hidenavbar = false;
      }

      if(vm.authentication.user != null && vm.authentication.user.orgRole != undefined && vm.authentication.user.orgRole[0] === 'waiter'){
        $state.transitionTo('app-download', $stateParams, { reload: true, inherit: false, notify: true });
      }

      // If user is signed in then redirect back home
      if (vm.authentication.user) {
        if (vm.authentication.user != null && vm.authentication.user.organization === undefined && vm.authentication.user.orgRole != undefined && vm.authentication.user.orgRole[0] !== 'waiter'){
          $rootScope.hidenavbar = true;
          $state.transitionTo('organizations.list', $stateParams, { reload: true, inherit: false, notify: true });
        }else{
          $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
        }
      } 
    }

    function signup(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }
      if(vm.user !== undefined){
        vm.user.email = vm.credentials.email;
        vm.user.name = vm.credentials.name;
        vm.user.password = vm.credentials.password;
        UsersService.userSignup(vm.user)
        .then(onUserSignupSuccess)
        .catch(onUserSignupError);
      }else{
         UsersService.userSignup(vm.credentials)
        .then(onUserSignupSuccess)
        .catch(onUserSignupError);
      } 
    }

    function signin(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      UsersService.userSignin(vm.credentials)
        .then(onUserSigninSuccess)
        .catch(onUserSigninError);
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }


    // Authentication Callbacks

    function onUserSignupSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      vm.setReadOnly = false;
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Signup successful!', positionY: 'bottom', positionX: 'center' });
      var previousUrl = localStorageService.get('previousChatUrl');

      if (previousUrl) {
        localStorageService.remove('previousChatUrl');
        $window.location.href = previousUrl;
      } else {
            if(vm.authentication.user != null && vm.authentication.user.orgRole != undefined && vm.authentication.user.orgRole[0] === 'waiter'){
              $state.transitionTo('app-download', $stateParams, { reload: true, inherit: false, notify: true });
            }else{
                $state.transitionTo('organizations.list', $stateParams, { reload: true, inherit: false, notify: true });
            }
        // $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
      }
    }

    function onUserSignupError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Signup Error!', delay: 6000, positionY: 'bottom', positionX: 'center', replaceMessage: true });
    }

    function onUserSigninSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      FirebaseService.saveUserInDB(Authentication.user, 'offline');
      // Notification.info({ message: 'Welcome ' + response.firstName });
      // And redirect to the previous or home page
       if(vm.authentication.user != null && vm.authentication.user.orgRole != undefined && vm.authentication.user.orgRole[0] === 'waiter'){
          $state.transitionTo('app-download', $stateParams, { reload: true, inherit: false, notify: true });
        }else if (vm.authentication.user != null && vm.authentication.user.organization === undefined && vm.authentication.user.orgRole != undefined && vm.authentication.user.orgRole[0] !== 'waiter'){
          $rootScope.hidenavbar = true;
          $state.transitionTo('organizations.list', $stateParams, { reload: true, inherit: false, notify: true });
        }else{
          $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
        }
      
    }

    function onUserSigninError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Signin Error!', delay: 6000, positionY: 'bottom', positionX: 'center', replaceMessage: true});
    }

     vm.getUser = function(userId){
        UsersService.getUser({userId: userId}).then(function(successResponse){
          vm.user = successResponse;
          vm.credentials.email = successResponse.email;
          vm.credentials.name = successResponse.displayName;

        },function(errorResponse){
          console.log(errorResponse);
        });
    };

    _init();
  }
}());
