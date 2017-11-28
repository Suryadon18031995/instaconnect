(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', '$rootScope', '$state', '$location', '$window', 'Notification', '$stateParams', 'WidgetsService', '$anchorScroll','UsersService','ProspectsService','localStorageService', '$timeout'];

  function HomeController($scope, $rootScope, $state, $location, $window, Notification, $stateParams, WidgetsService, $anchorScroll,UsersService,ProspectsService,localStorageService, $timeout) {
    var _this = this;
    _this.conversationCode = '';
    $rootScope.noContainer = true;
    _this.prospects = {};
    _this.showCamera = false;
    _this.showInstructionModal = false;

    var $ = angular.element;
    _this.initFunctionHome = function () {
      var conversationCode = $location.search().wCode;
      if(conversationCode !== undefined) {
        _this.showInstructionModal = true;
        _this.showLoading = true;
        _this.conversationCode = conversationCode;
        _this.joinConversation();
      }
    }
    _this.joinConversation = function (conversationCode) {
      WidgetsService.widgetByConversationCode(_this.conversationCode).then(function (response) {
        if (response === undefined) {
          Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Invalid Conversation Code Entered, Please Enter Valid Conversation Code', positionY: 'bottom', positionX: 'center', delay: 5000 });
        } else {
          if (response.assignedTo != undefined && response.assignedTo != null) {  
            var waiter = response.assignedTo;
            var chatUrl = waiter._id ? $window.location.origin + '/' + waiter._id + '/talk?via=web&wcode=' + response.uniqueCode  : _this.chatUrl = $window.location.origin + '/' + waiter.displayName + '/talk?via=web&wcode=' + response.uniqueCode;
            _this.createProspects(waiter._id,chatUrl);
          } else {
            Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Server not assigned', positionY: 'bottom', positionX: 'center', delay: 5000 });
            if ($location.search().wCode) {
            window.location.href='/';
          }
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
        localStorageService.set('showChat',false);
        _this.showLoading = false;
        $window.location.href = chatUrl;
      }, function (errorResponse) {
        console.log(errorResponse);
      });
    };

    _this.startScan = function() {
      $rootScope.$emit('startScan', true);
      // $timeout(function() {
      _this.showCamera = true;
      // },0);
    };

    $rootScope.$on('stopScan', function(ev, data){
      if (data) {
        console.log('stop event received')
        _this.showCamera = false;
      }
    });

    $scope.$on('cameraErr', function(ev, data) {
      if (data) {
        $('#instructionModal').modal('show');    
        $timeout(function() {
          _this.showCamera = false;
        }, 0);
      }
    });

    $scope.$on('backCameraErr', function(ev, data) {
      if (data) {
        $('#instructionModal').modal('show');
          $timeout(function() {
            _this.showCamera = false;
          }, 0);
      }
    })
    _this.moveScrollDown = function (id, mul) {
      $('.content').animate({ scrollTop: (($('#howItWorks').height() + 10) * mul) }, 1000, 'linear');
    };

  }
}());
