'use strict';

angular.module('chats').directive('instaConnectChat', [
  function () {
    return {
      templateUrl: '/modules/chats/client/views/directives/instaconnect-chat.client.view.html',
      restrict: 'E',
      scope: {
        'user': '=',
        'prospects': '='
      },
      controllerAs: 'instaConnectChatController',
      controller: ['$scope', '$rootScope', '$interpolate', '$firebaseObject', 'UsersService', '$firebaseAuth', 'localStorageService', 'ProspectsService', '$firebaseArray', 'Notification', 'PushNotificationService', 'FirebaseService', 'ChatsService', '_', '$uibModal', 'Authentication', '$location', 'WidgetsService', '$window', '$http', '$timeout','$state','$stateParams','Fullscreen','CommonService',
        function ($scope, $rootScope, $interpolate, $firebaseObject, UsersService, $firebaseAuth, localStorageService, ProspectsService, $firebaseArray, Notification, PushNotificationService, FirebaseService, ChatsService, _, $uibModal, Authentication, $location, WidgetsService, $window, $http, $timeout,$state,$stateParams,Fullscreen,CommonService) {
          var _this = this;
          _this.user = $scope.user !== undefined ? $scope.user.user : null;
          _this.Authentication = Authentication;

          _this.conversations = null;
          _this.selectedConversation = null;
          _this.conversationId = null;
          _this.displayName = '';
          _this.newMessage = '';
          _this.isRedirected = false;
          _this.isInstaConnectUser = false;
          _this.campaignName = '';
          _this.lastMessage = '';
          _this.unreadCount = 0;
          _this.messages = null;
          _this.isConversationBlocked = false;
          _this.isUserFinishedConversation = false;
          _this.salesPersonCheckedInStatus = false;
         
          function init() {
            var unregister = $scope.$watch('prospects', function (newValue, oldValue, scope) {
              if ($scope.prospects && $scope.prospects._id !== undefined) {
                _this.authenticateFirebase();
                unregister();
              } else if (Authentication.user) {
                _this.authenticateFirebase();
                unregister();
              }
            });
          }

          _this.enableFullScreen = function() {
             $timeout(function() {
                if (CommonService.isMobile()) {
                  if (!Fullscreen.isEnabled()) {
                    Fullscreen.all();
                  }
                }
              }, 0, false);
          };

          _this.AddDummyView = function() {
              _this.enableFullScreen();
              $timeout(function() {
                angular.element('#virtual_scroll').css('height', '45vh');
                var scroller = document.getElementById("autoscroll");
                var fullHeight = window.screen.height;
                var containerHeight = scroller.offsetHeight;
                var diffHeight = fullHeight - containerHeight;
                scroller.scrollTop = (diffHeight * 6) - (diffHeight - 30);
              }, 0, false);
          };

          _this.removeDummyView = function() {
              $timeout(function() {
                angular.element('#virtual_scroll').css('height', '0vh');
                var scroller = document.getElementById("autoscroll");
                scroller.scrollTop = scroller.scrollHeight;
              }, 0, false);
          };

          _this.disableFullScreen = function() {
              if (CommonService.isMobile()) {
                if (Fullscreen.isEnabled()) {
                  Fullscreen.cancel();
                }
              }
          };

          $scope.$on('send-to-message',function(event,args){
            $timeout(function(){
              _this.newMessage = args.message;
              _this.sendMessage();
            },100);
          });

          _this.finishChat = function() {
            _this.disableFullScreen();
            _this.removeConversation();
          }

          _this.removeConversation = function() {
            _this.isUserFinishedConversation = true;
            $state.transitionTo('home', $stateParams, { reload: true, inherit: false, notify: true });
            var obj = $firebaseObject(_this.ref.child('conversations').child(_this.userId).child(_this.conversationId).child('isBlocked'));
              obj.$loaded().then(function () {
                obj.$value = true;
                obj.$save().then(function () {
                }, function (error) {
                  console.log('Error:', error);
                });
            });
          }

          _this.sendFrequentRequestDirective = function () {
              $rootScope.$emit('show_frequent_request',true);
          }

          _this.authenticateFirebase = function (fetchMessages) {
            if ($rootScope.showNotification) {
              $rootScope.showNotification = false;
            }

            var user = Authentication.user ? Authentication.user : _this.user;
            FirebaseService.getDBRef(user, function (ref) {
              _this.ref = ref;

              if (Authentication.user) {
                FirebaseService.saveUserInDB(Authentication.user, 'online');
              }

              var wcode = $location.search().wcode;
              if (wcode) {
                _this.getWidgetByUniqueCode();
              }

              var prospects = localStorageService.get('prospects');
              if (prospects) {
                _this.prospects = prospects;
              }

              _this.userId = Authentication.user ? Authentication.user._id : _this.user._id;

              if (_this.user) {
                _this.conversationId = Authentication.user ? _this.user._id + '_' + Authentication.user._id : _this.userId + '_' + _this.prospects._id;
              }

              if (Authentication.user) {
                _this.isInstaConnectUser = true;
                _this.displayName = Authentication.user.displayName;
                if (!wcode) {
                  _this.updateMessages();
                }
              } else {
                _this.isInstaConnectUser = false;
                _this.displayName = _this.prospects.name;

                if (!wcode) {
                  _this.getConversations();
                }
              }
            });
          };

          _this.getConversations = function () {
            var userConversations = $firebaseArray(_this.ref.child('conversations').child(_this.userId));
            userConversations.$loaded().then(function () {

              var showRequest = localStorageService.get('showChat');
              if (showRequest !== null && showRequest !== undefined) {
                localStorageService.remove('showChat');
                _this.sendFrequentRequestDirective();
                _this.enableFullScreen();
              }

              
              _this.conversations = _.orderBy(userConversations, ['timeStamp'], ['desc']);

              if (Authentication.user && _this.conversations.length > 0 && _this.conversationId === null) {
                _this.selectedConversation = _this.conversations[0];
                _this.conversationId = _this.selectedConversation.conversationId === undefined ? _this.selectedConversation.$id : _this.selectedConversation.conversationId;
              }

              if (!Authentication.user && userConversations.length === 0) {
                _this.createNewConversation();
              } else {
                var isMatched = false;
                angular.forEach(userConversations, function (conversation, key) {
                  if (conversation.conversationId === _this.conversationId) {
                    isMatched = true;
                    _this.selectedConversation = conversation;
                    _this.showConversation();
                  }
                });

                if (!isMatched && _this.conversationId) {
                  _this.createNewConversation();
                } else {
                  _this.messages = [];
                }
              }

            });
          };

          _this.updateUnReadCount = function(conversation) {
            conversation.unreadCount = 0;
            var obj = $firebaseObject(_this.ref.child('conversations').child(_this.userId).child(conversation.conversationId));
            obj.$loaded().then(function() {
              obj.unreadCount = 0;
              obj.timeStamp = Date.now();

              obj.$save().then(function (ref) {
                console.info('Updated unread count!');
              }, function (error) {
                console.log('Error:', error);
              });
            });
          };

          _this.createNewConversation = function () {
            var obj = $firebaseObject(_this.ref.child('conversations').child(_this.userId).child(_this.conversationId));
            obj.$loaded().then(function () {
              obj.conversationId = _this.conversationId;
              obj.lastMessage = '';
              obj.name = _this.user ? _this.user.displayName : _this.displayName;
              obj.timeStamp = Date.now();
              obj.unreadCount = 0;
              obj.isRedirected = _this.isRedirected;
              obj.isInstaConnectUser = _this.isInstaConnectUser;
              obj.campaignName = _this.campaignName;
              obj.widgetId = _this.widgetId;
              obj.isBlocked = false;

              if (_this.user) {
                obj.userId = _this.user._id;
              }

              obj.$save().then(function (ref) {
                _this.selectedConversation = obj;
                _this.conversations.push(_this.selectedConversation);
                _this.conversations = _.orderBy(_this.conversations, ['timeStamp'], ['desc']);
                if (Authentication.user && _this.user) {
                  _this.createNewUserConversation();
                }
                _this.showConversation();
              }, function (error) {
                console.log('Error:', error);
              });
            });
          };

          _this.createNewUserConversation = function() {
            var obj = $firebaseObject(_this.ref.child('conversations').child(_this.user._id).child(_this.conversationId));
            obj.$loaded().then(function () {
              obj.conversationId = _this.conversationId;
              obj.lastMessage = '';
              obj.name = Authentication.user.displayName;
              obj.timeStamp = Date.now();
              obj.unreadCount = 0;
              obj.isRedirected = _this.isRedirected;
              obj.isInstaConnectUser = _this.isInstaConnectUser;
              obj.campaignName = _this.campaignName;
              obj.widgetId = _this.widgetId;
              obj.userId = Authentication.user._id;
              obj.isBlocked = false;

              obj.$save().then(function (ref) {
                console.info('New User Conversation Saved!');
              }, function (error) {
                console.log('Error:', error);
              });
            });
          };

          _this.showConversation = function () {
            _this.messages = null;
            if (_this.selectedConversation.unreadCount > 0) {
              _this.updateUnReadCount(_this.selectedConversation);
            }
            _this.getConversationMessages();
            if (_this.user) {
              _this.getFirebaseSalesPerson(_this.user._id);
            } else if (_this.selectedConversation.userId !== undefined) {
              _this.getFirebaseSalesPerson(_this.selectedConversation.userId);
            }

            _this.saveLoggedInUserLocation();
          };

          _this.getConversationMessages = function () {
            var messages = $firebaseArray(_this.ref.child('messages').child(_this.conversationId));
            messages.$loaded().then(function () {
              _this.messages = messages;
            });
          };

          _this.getFirebaseSalesPerson = function (userId) {
            var userObj = $firebaseObject(_this.ref.child('users').child(userId));
            var conversationObj = $firebaseObject(_this.ref.child('conversations').child(_this.user._id).child(_this.conversationId).child('isBlocked'));

            userObj.$loaded().then(function () {
              _this.firebaseSalesPerson = userObj;
              _this.salesPersonStatus = _this.firebaseSalesPerson.status;
              _this.lastSeenTime = _this.firebaseSalesPerson.lastSeen;
              _this.salesPersonCheckedInStatus = _this.firebaseSalesPerson.isCheckedIn;

              _this.firebaseSalesPerson.$watch(function () {
                _this.salesPersonStatus = _this.firebaseSalesPerson.status;
                _this.lastSeenTime = _this.firebaseSalesPerson.lastSeen;
                _this.salesPersonCheckedInStatus = _this.firebaseSalesPerson.isCheckedIn;
              });
            });

             conversationObj.$loaded().then(function () {
              _this.conversationBlocked = conversationObj;

              _this.conversationBlocked.$watch(function () {
                _this.isConversationBlocked = _this.conversationBlocked.$value;
                if (_this.isConversationBlocked && !_this.isUserFinishedConversation) {
                  Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Waiter blocked you', positionY: 'bottom', positionX: 'center', delay: 5000 });
                }
              });
            });
          };


          _this.sendMessage = function () {
            if (_this.user.userStatus || _this.salesPersonCheckedInStatus){

              if (this.selectedConversation.isBlocked || _this.isConversationBlocked) {
                Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Waiter blocked you', positionY: 'bottom', positionX: 'center', delay: 5000 });  
                return; 
              }
          
              if (_this.newMessage.trim().length > 0) {  
                var messages = _this.ref.child('messages').child(_this.conversationId).push();
                messages.set({
                  'content': _this.newMessage,
                  'senderMail': Authentication.user ? Authentication.user.email : _this.prospects.email,
                  'senderName': "",
                  'senderId': Authentication.user ? Authentication.user._id : _this.prospects._id,
                  'timeStamp': Date.now()
                }).then(function () {
                  // console.log('Synchronization succeeded');
                }).catch(function () {
                  // console.log('Synchronization failed');
                });

                _this.lastMessage = _this.newMessage;

                if (_this.salesPersonStatus === 'offline') {
                  _this.unreadCount += 1;
                  if (_this.firebaseSalesPerson.playerId !== null && _this.firebaseSalesPerson.playerId !== undefined) {
                    // Sending request to server to send push notification!
                    var data = {
                      'message': _this.newMessage,
                      'conversationId': _this.conversationId,
                      'playerId': _this.firebaseSalesPerson.playerId,
                      'senderName': _this.displayName
                    };

                    PushNotificationService.sendNotification(data).then(function (response) {
                      var offlineData = {
                        'message': data.message,
                        'prospectsId': Authentication.user ? Authentication.user._id : _this.prospects._id,
                        'userId': _this.user._id
                      };

                      // ChatsService.sendOfflineMessage(offlineData).then(function (response) {
                      //   // console.info(response);
                      // }, function (errorResponse) {
                      //   console.log(errorResponse);
                      // });
                    }, function (errorResponse) {
                      console.log(errorResponse);
                    });
                  }
                }

                if (_this.user || _this.selectedConversation.userId) {
                  var userId = _this.user ? _this.user._id : _this.selectedConversation.userId;
                  _this.updateUserConversation(userId);
                }
                if (Authentication.user) {
                  _this.updateLoggedInUserConversation(_this.selectedConversation.$id);
                }
                _this.newMessage = '';
              }
            }else {
              Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Waiter is checked out', positionY: 'bottom', positionX: 'center', delay: 5000 });
            }
          };

          _this.getWidgetByUniqueCode = function () {
            var wcode = $location.search().wcode;
            _this.channel = $location.search().via;

            if (!wcode) {
              return;
            }

            WidgetsService.widgetByUniqueCode(wcode).then(function (response) {
              _this.campaignName = response.widgetName;
              _this.widgetId = response._id;

              if (Authentication.user) {
                _this.updateMessages();
              } else {
                _this.getConversations();
              }
            }, function (error) {
              console.info(error);
            });
          };

          _this.updateMessages = function () {
            if (_this.prospects && _this.user) {
              var loggedInUserConversationId = _this.user._id + '_' + Authentication.user._id;
              var prospectsConversationId = _this.user._id + '_' + _this.prospects._id;

              var prospectsMessages = $firebaseArray(_this.ref.child('messages').child(prospectsConversationId));
              prospectsMessages.$loaded().then(function () {
                _.each(prospectsMessages, function (message) {
                  if (message.senderId === _this.prospects._id) {
                    message.senderMail = Authentication.user.email;
                    message.senderName = Authentication.user.displayName;
                    message.senderId = Authentication.user._id;
                  }

                  var messages = _this.ref.child('messages').child(_this.conversationId).push();
                  messages.set({
                    'content': message.content,
                    'senderMail': message.senderMail,
                    'senderName': message.senderName,
                    'senderId': message.senderId,
                    'timeStamp': message.timeStamp
                  }).then(function () {
                    console.info('Message set successfully!');
                    prospectsMessages.$remove(message).then(function () {
                      console.info('old message removed');
                    });
                  }).catch(function () {
                    console.info('Message set successfully!');
                  });
                });
                _this.createLoggedInUserConversation(prospectsConversationId, loggedInUserConversationId);
              });
            } else {
              _this.getConversations();
            }
          };

          _this.createLoggedInUserConversation = function (prospectsConversationId, loggedInUserConversationId) {
            var obj = $firebaseObject(_this.ref.child('conversations').child(_this.userId).child(loggedInUserConversationId));
            obj.$loaded().then(function () {
              obj.name = _this.user.displayName;
              obj.conversationId = _this.conversationId;
              obj.isInstaConnectUser = _this.isInstaConnectUser;
              obj.campaignName = _this.campaignName;
              obj.isRedirected - _this.isRedirected;
              obj.lastMessage = '';
              obj.unreadCount = 0;
              obj.timeStamp = Date.now();
              obj.userId = _this.user._id;
              obj.widgetId = _this.widgetId;
              obj.$save().then(function (ref) {
                localStorageService.remove('prospects');
                _this.updateProspectsData();
                _this.saveLoggedInUserLocation();
                // _this.conversationId = prospectsConversationId;
                _this.updateUserConversation(_this.user._id);
                _this.getConversations();
              }, function (error) {
                console.log('Error:', error);
              });
            });
          };

          _this.updateLoggedInUserConversation = function (conversationId) {
            var obj = $firebaseObject(_this.ref.child('conversations').child(_this.userId).child(conversationId));
            obj.$loaded().then(function () {
              obj.lastMessage = _this.lastMessage;
              obj.timeStamp = Date.now();

              obj.$save().then(function (ref) {
              }, function (error) {
                console.log('Error:', error);
              });
            });
          };

          _this.updateUserConversation = function (userId) {
            var obj = $firebaseObject(_this.ref.child('conversations').child(userId).child(_this.conversationId));
            obj.$loaded().then(function () {
              obj.lastMessage = _this.lastMessage;
              obj.unreadCount = _this.unreadCount;
              obj.isInstaConnectUser = _this.isInstaConnectUser;
              obj.timeStamp = Date.now();
              obj.name = "";
              obj.userId = Authentication.user ? Authentication.user._id : _this.prospects._id;

              obj.$save().then(function (ref) {
              }, function (error) {
                console.log('Error:', error);
              });
            });
          };

          _this.selectConversation = function (conversation) {
            _this.messages = null;

            $timeout(function () {
              _this.selectedConversation = conversation;
              _this.conversationId = _this.selectedConversation.conversationId;
              _this.showConversation();
            }, 1000);
          };

          this.updateProspects = function () {
            ProspectsService.updateProspects(_this.prospects._id, _this.prospects).then(function (response) {
              _this.prospects = null;
            }, function (errorResponse) {
              console.log(errorResponse);
            });
          };

          _this.updateProspectsData = function () {
            _this.prospects.email = Authentication.user.email;
            _this.prospects.name = Authentication.user.displayName;
            _this.prospects.loggedInUserId = Authentication.user._id;
            _this.updateProspects();
          };

          _this.saveLoggedInUserLocation = function() {
            if (!Authentication.user) {
              return;
            }
            var userLocation = {};
            if ($window.navigator) {
              $window.navigator.geolocation.getCurrentPosition(function(position) {
                var latLng = position.coords.latitude + ',' + position.coords.longitude;
                userLocation.location = latLng;

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

                  userLocation.address = formattedAddress.join(', ');
                  userLocation.channel = _this.channel === undefined ? 'web' : _this.channel;
                  userLocation.userId = Authentication.user._id;

                  ProspectsService.saveUserLocation(userLocation).then(function(response) {
                    _this.loggedInUserLocation = userLocation;
                  }, function(error) {
                    console.error(error);
                  });
                }, function errorCallback(error) {
                  console.info(error);
                });
              });
            }
          };

          init();

        }
      ]
    };
  }
]);
