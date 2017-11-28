'use strict';

angular.module('core').service('FirebaseService', ['firebase', '$firebaseObject', '$firebaseAuth', '$firebaseArray', '$firebaseStorage', 'UsersService', 'Authentication', '$rootScope', '_',
  function (firebase, $firebaseObject, $firebaseAuth, $firebaseArray, $firebaseStorage, UsersService, Authentication, $rootScope, _) {
    var _this = this;
    _this.config = {
      apiKey: 'AIzaSyD8y-Pw8rbzT1nxifsAMb00kW5z4W-hBJM',
      databaseURL: 'https://instaconnect-dca25.firebaseio.com',
      storageBucket: 'instaconnect-dca25.appspot.com'
    };

    function init() {
      firebase.initializeApp(_this.config);
      if (Authentication.user) {
        _this.watchConversations();
      }
    }

    _this.authenticate = function (user, callback) {
      UsersService.customToken(user._id).then(function (response) {
        var authObj = $firebaseAuth(firebase.auth());
        var token = response.token;

        authObj.$signInWithCustomToken(token).then(callback).catch(function (error) {
          console.error('Authentication failed:', error);
        });
      }).catch(function (errorResponse) {
        console.error(errorResponse);
      });
    };

    _this.getDBRef = function (user, callback) {
      _this.authenticate(user, function () {
        var ref = firebase.database().ref();
        callback(ref);
      });
    };

    _this.getStorageRef = function (user, callback) {
      _this.authenticate(user, function () {
        var ref = firebase.storage().ref();
        callback(ref);
      });
    };

    _this.saveUserInDB = function (user, status) {
      _this.getDBRef(user, function (ref) {
        var userObj = $firebaseObject(ref.child('users').child(user._id));
        userObj.$loaded().then(function () {
          userObj.email = user.email;
          userObj.lastSeen = Date.now();
          userObj.status = status;
          userObj.userName = user.displayName;

          userObj.$save().then(function (reference) { });
        });
      });
    };

    _this.watchConversations = function() {
      _this.getDBRef(Authentication.user, function (ref) {
        var conversationsArray = $firebaseArray(ref.child('conversations').child(Authentication.user._id));
        conversationsArray.$loaded().then(function() {
          _.each(conversationsArray, function(conversation) {
            if (conversation.unreadCount > 0) {
              $rootScope.showNotification = true;
            }
          });

          conversationsArray.$watch(function(e) {
            if (e.event === 'child_changed') {
              _this.loadConversation(e.key);
            }
          });
        });
      });
    };

    _this.loadConversation = function(conversationId) {
      _this.getDBRef(Authentication.user, function (ref) {
        var obj = $firebaseObject(ref.child('conversations').child(Authentication.user._id).child(conversationId));
        obj.$loaded().then(function() {
          if (obj.unreadCount > 0) {
            $rootScope.showNotification = true;
          }
        });
      });
    };

    init();
  }
]);
