(function () {
  'use strict';

  angular
    .module('chats')
    .controller('ChatsController', ChatsController);

  ChatsController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'UsersService', 'userResolve', 'localStorageService', 'ProspectsService', 'Notification', '_', 'Authentication', '$location', 'WidgetsService', '$window', '$http', 'FrequentRequestService','$timeout','Fullscreen','CommonService'];

  function ChatsController($scope, $rootScope, $state, $stateParams, UsersService, userResponse, localStorageService, ProspectsService, Notification, _, Authentication, $location, WidgetsService, $window, $http, FrequentRequestService, $timeout,Fullscreen,CommonService) {
    var _this = this;
    _this.Authentication = Authentication;
    $rootScope.hideNavBar = true;
    $rootScope.setBackground = true;
    _this.showChat = true;
    _this.requestList = [];
    _this.prospects = {};
    _this.conversationCode = '';
   
    // Chats controller logic

    function init() {
      _this.userResponse = userResponse;
      _this.user = userResponse.user;
      _this.isRedirected = userResponse.isRedirected;
      _this.getWidgetByUniqueCode();
      _this.getFrequentRequestList();
    }

    _this.getFrequentRequestList = function(id) {
      // _this.user.organization
        var id = _this.user.organization;
        console.log(_this.user.organization);
        FrequentRequestService.getFrequentRequestsByOrgId(id).then(function(frequentRequestList) {

            _this.requestList = frequentRequestList;
            // _this.createProspects(true);
        }, function(error){
            Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> No frequent request found', positionY: 'bottom', positionX: 'center', delay: 5000 });
        });
    };

    $rootScope.$on('show_frequent_request', function(ev, data) {
        if(data) {
          _this.showChat = false;
        }
    })

    _this.sendFrequentRequest = function (fRequest,checkbox) {
        // if (_this.user.userStatus) {
    		if(fRequest.routingType === 'defaultroute')
    		{
    			$scope.$broadcast('send-to-message',{message:fRequest.message});
    	          _this.showChat = true;
    	       // _this.createProspects(true);
    		}
    		if(fRequest.routingType === 'staffroute')
    		{
    			FrequentRequestService.getStaffRequestEntityByRequestId(fRequest._id).then(function(staffRequestEntity) {
    				console.log(staffRequestEntity[0].staffId);
    				var chatUrl = staffRequestEntity[0].staffId ? $window.location.origin + '/' + staffRequestEntity[0].staffId + '/talk?via=web&wcode=' + $location.search().wcode  : _this.chatUrl = $window.location.origin + '/' + $location.search().wcode + '/talk?via=web&wcode=' + $location.search().wcode;
    	              _this.createProspects(staffRequestEntity[0].staffId,chatUrl);
    				_this.showChat = true;
    			}, function(error){
    	            Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> No frequent request found', positionY: 'bottom', positionX: 'center', delay: 5000 });
    	        });
    		}
          
        // }else {
          // Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Waiter is checked out', positionY: 'bottom', positionX: 'center', delay: 5000 });
        // }
    }
    
    _this.createProspects = function (waiterId, chatUrl) {
        _this.prospects.userId = waiterId;
        ProspectsService.saveProspects(_this.prospects).then(function (response) {
          _this.prospects = response;
          localStorageService.set('prospectsChat', _this.prospects);
          localStorageService.set('showChat',false);
          _this.showLoading = false;
          $window.location.href = chatUrl;
        }, function (errorResponse) {
          console.log(errorResponse);
        });
      };
    
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

    _this.goToChat = function(){
        _this.showChat = true;
    }

    _this.validateProspects = function() {
      if (Authentication.user && Authentication.user.displayName) {
        _this.showChat = true;
        $rootScope.setBackground = false;
      }

      var prospects = localStorageService.get('prospects');
      if (prospects) {
        _this.prospects = prospects;
      }

      if (!Authentication.user) {
        if (_this.prospects) {
          _this.showChat = true;
          $rootScope.setBackground = false;
        } else {
          _this.prospects = {};
          _this.showChat = false;
          $rootScope.setBackground = true;
        }
      } else {
        _this.showChat = true;
        $rootScope.setBackground = false;
      }
      
    };

    _this.updateProspects = function () {
      ProspectsService.updateProspects(_this.prospects._id, _this.prospects).then(function (response) {
        _this.prospects = response;
        localStorageService.set('prospects', _this.prospects);
      }, function (errorResponse) {
        console.log(errorResponse);
      });
    };

    _this.updateProspectsData = function () {
      _this.prospects.email = Authentication.user.email;
      _this.prospects.name = Authentication.user.displayName;
      _this.updateProspects();
    };

    _this.getWidgetByUniqueCode = function() {
      var wcode = $location.search().wcode;
      _this.channel = $location.search().via;

      WidgetsService.widgetByUniqueCode(wcode).then(function(response) {
        if (response === undefined) {
          $state.transitionTo('widget-not-found', $stateParams, { reload: true, inherit: false, notify: true });
        } else {
          _this.campaignName = response.widgetName;
          _this.validateProspects();
          // if ($scope.newConversation) {
          //   $rootScope.widgetName = response.widgetName;
          // }
        }
      }, function(error) {
        console.info(error);
      });
    };

    _this.getProspectsLocation = function() {
      if ($window.navigator) {
        $window.navigator.geolocation.getCurrentPosition(function(position) {
          var latLng = position.coords.latitude + ',' + position.coords.longitude;
          _this.prospects.location = latLng;

          var reverseGeoUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latLng;

          $http({
            method: 'GET',
            url: reverseGeoUrl
          }).then(function successCallback(response) {
            var result = response.data.results[0];
            var addressComponents = result.address_components;
            var formattedAddress = [];

            _.each(addressComponents, function(addressComponent) {
              if (addressComponent.types.indexOf('administrative_area_level_2') !== -1 || addressComponent.types.indexOf('country') !== -1) {
                formattedAddress.push(addressComponent.long_name);
              }

              if (addressComponent.types.indexOf('administrative_area_level_1') !== -1) {
                formattedAddress.push(addressComponent.short_name);
              }
            });


            _this.prospects.address = formattedAddress.join(', ');
            _this.prospects.channel = _this.channel;
            _this.updateProspects();
          }, function errorCallback(error) {
            console.info(error);
          });
        });
      }
    };
    init();
  }
}());
