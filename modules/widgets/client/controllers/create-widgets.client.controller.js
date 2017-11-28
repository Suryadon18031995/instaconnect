(function () {
  'use strict';

  // Widgets controller
  angular
    .module('widgets')
    .controller('CreateWidgetController', CreateWidgetController);

  CreateWidgetController.$inject = ['$scope', '$state', '$window', 'Authentication', 'WidgetsService', '$firebaseStorage', '$firebaseAuth', 'UsersService', 'Upload', 'FirebaseService', 'Notification', '$base64', '$stateParams'];

  function CreateWidgetController($scope, $state, $window, Authentication, WidgetsService, $firebaseStorage, $firebaseAuth, UsersService, Upload, FirebaseService, Notification, $base64, $stateParams) {
    var _this = this;
    _this.showEmail = true;
    _this.showDocument = false;
    _this.showWeb = false;
    _this.authentication = Authentication;
    _this.user = _this.authentication.user;

    function init() {
      FirebaseService.getStorageRef(_this.user, function (ref) {
        _this.ref = ref;
      });

      _this.baseUrl = $window.location.origin;
      _this.widget = {
        'imageUrl': '/modules/core/client/img/brand/logo.png',
        'color': '#78909C',
        'widgetText': 'Ask me anything'
      };

      if (_this.widget.imageUrl.startsWith('/modules')) {
        _this.logoUrl = $window.location.origin + _this.widget.imageUrl;
      } else {
        _this.setLogoUrl();
      }

      if (_this.user.userName) {
        _this.chatUrl = $window.location.origin + '/' + _this.user.userName + '/talk?via=email';
        _this.originalUrl = $window.location.origin + '/' + _this.user.userName + '/talk';
      } else {
        _this.chatUrl = $window.location.origin + '/' + _this.user._id + '/talk?via=email';
        _this.originalUrl = $window.location.origin + '/' + _this.user._id + '/talk';
      }
    }

    _this.saveWidget = function () {
      _this.widget.user = _this.user._id;
      if (!_this.picFile) {
        // _this.restoreDefault();
        if (!_this.widget._id) {
          _this.createWidget();
        } else {
          _this.uploadFile(_this.widget, function (downloadURL) {
            _this.widget.imageUrl = downloadURL;
            _this.updateWidget();
          });
        }
      } else {
        if (!_this.widget._id) {
          _this.createWidget();
        } else {
          _this.uploadFile(_this.widget, function (downloadURL) {
            _this.widget.imageUrl = downloadURL;
            _this.updateWidget();
          });
        }
      }
    };

    _this.createWidget = function () {
      WidgetsService.createWidget(_this.widget).then(function (response) {
        _this.widget = response;
        if (!_this.picFile) {
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Widget created successfully!', positionY: 'bottom', positionX: 'center' });
          $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
        } else {
          _this.uploadFile(_this.widget, function (downloadURL) {
            _this.widget.imageUrl = downloadURL;
            _this.updateWidget();
          });
        }
      }, function (err) {
        console.log(err);
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to create widget. Please try again!', positionY: 'bottom', positionX: 'center' });
      });
    };

    _this.updateWidget = function () {
      WidgetsService.updateWidget(_this.widget._id, _this.widget).then(function (response) {
        _this.widget = response;
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Widget created successfully!', positionY: 'bottom', positionX: 'center' });
        $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
        // Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Widget updated successfully!', positionY: 'bottom', positionX: 'center' });
      }, function (err) {
        console.log(err);
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to update widget. Please try again!', positionY: 'bottom', positionX: 'center' });
      });
    };

    _this.uploadFile = function (widget, callback) {
      _this.storageObject = $firebaseStorage(_this.ref.child('images').child('widgets').child(widget._id));

      if (!_this.picFile && _this.defaultImageInBase64) {
        var uploadTask = _this.storageObject.$putString(_this.defaultImageInBase64, 'base64', { contentType: 'image/png' });
        uploadTask.$complete(function (snapshot) {
          _this.widget.imageUrl = snapshot.downloadURL;
          _this.setLogoUrl();
          _this.logoUrl = _this.widget.imageUrl;
          callback(snapshot.downloadURL);
        });
      } else if (_this.picFile) {
        Upload.base64DataUrl(_this.picFile).then(function (base64Urls) {
          var base64String = base64Urls.split(',')[1].toString();
          var uploadTask = _this.storageObject.$putString(base64String, 'base64', { contentType: _this.picFile.type });

          uploadTask.$complete(function (snapshot) {
            _this.widget.imageUrl = snapshot.downloadURL;
            _this.setLogoUrl();
            _this.logoUrl = _this.widget.imageUrl;
            callback(snapshot.downloadURL);
          });
        });
      }

    };

    _this.setLogoUrl = function () {
      if (_this.widget._id) {
        _this.logoUrl = $window.location.origin + '/api/widget_image/' + _this.widget._id;
      } else {
        _this.logoUrl = _this.widget.imageUrl;
      }
    };

    _this.convertRGB = function () {
      var hex = _this.widget.color.replace('#', ''),
        red = parseInt(hex.substring(0, 2), 16),
        green = parseInt(hex.substring(2, 4), 16),
        blue = parseInt(hex.substring(4, 6), 16);
      _this.rgbColor = 'Red: ' + red + ', Green: ' + green + ', Blue: ' + blue;
    };

    _this.restoreDefault = function (callback) {
      _this.picFile = $window.location.origin + '/modules/core/client/img/brand/logo.png';
      _this.fileSelected = $window.location.origin + '/modules/core/client/img/brand/logo.png';
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
      };
      xhr.send();
    };

    _this.showDocumentDetails = function (documentType) {
      _this.showEmail = false;
      _this.showDocument = false;
      _this.showWeb = false;
      switch (documentType) {
        case 'email':
          _this.showEmail = true;
          _this.chatUrl = _this.originalUrl + '?via=email';
          break;
        case 'document':
          _this.showDocument = true;
          _this.chatUrl = _this.originalUrl + '?via=document';
          break;
        case 'web':
          _this.showWeb = true;
          _this.chatUrl = _this.originalUrl + '?via=web';
          break;

        default:
          _this.showEmail = true;
          _this.chatUrl = _this.originalUrl + '?via=email';
          break;
      }
    };

    _this.cancel = function() {
      $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
    };

    init();


  }
  
}());
