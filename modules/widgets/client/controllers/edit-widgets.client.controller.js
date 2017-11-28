(function () {
  'use strict';

  // Widgets controller
  angular
    .module('widgets')
    .controller('EditWidgetController', EditWidgetController);

  EditWidgetController.$inject = ['$scope', '$rootScope', '$state', '$window', 'Authentication', 'WidgetsService', '$firebaseStorage', '$firebaseAuth', 'UsersService', 'Upload', 'FirebaseService', 'Notification', '$base64', 'widgetResolve', '$stateParams'];

  function EditWidgetController($scope, $rootScope, $state, $window, Authentication, WidgetsService, $firebaseStorage, $firebaseAuth, UsersService, Upload, FirebaseService, Notification, $base64, widget, $stateParams) {
    var _this = this;
    _this.showEmail = true;
    _this.showDocument = false;
    _this.showWeb = false;
    _this.authentication = Authentication;
    _this.user = _this.authentication.user;
    _this.multiple_widget=new Object();
    
    $scope.tabName = "tab1";
    $scope.submitted=false;
    
    function init() {
      $('li#widgets').addClass('active');
      _this.widget = widget;
      _this.setLogoUrl();
      FirebaseService.getStorageRef(_this.user, function (ref) {
        _this.ref = ref;
      });
      if($stateParams.widgetId){
        $scope.editMode=true
      }else{
        WidgetsService.getUniqueCode().then(function(uniqueCode) {
             _this.widget.conversationCode=uniqueCode.unique_code
        })
      }
      
      _this.getUniqueCode = function()
      {
    	  WidgetsService.getUniqueCode()
    	  .then(
    			  function(uniqueCode) {
              _this.widget.conversationCode=uniqueCode.unique_code;
         })
      }
      
      if (!$stateParams.widgetId) {
        _this.widget = {
          'imageUrl': '/modules/core/client/img/brand/logo.png',
          'color': '#78909C'
          // conversationCode:'333-666-999'
          // 'widgetText': 'Ask me anything'
        };

        if (_this.widget.imageUrl.startsWith('/modules')) {
          _this.logoUrl = $window.location.origin + _this.widget.imageUrl;
        } else {
          _this.setLogoUrl();
        }
      }

      _this.baseUrl = $window.location.origin;

      if (_this.user.userName) {
        _this.chatUrl = $window.location.origin + '/' + _this.user.userName + '/talk?via=email&wcode=' + _this.widget.uniqueCode;
        _this.originalUrl = $window.location.origin + '/' + _this.user.userName + '/talk';
      } else {
        _this.chatUrl = $window.location.origin + '/' + _this.user._id + '/talk?via=email&wcode=' + _this.widget.uniqueCode;
        _this.originalUrl = $window.location.origin + '/' + _this.user._id + '/talk';
      }

      $scope.active = $rootScope.showInstructions ? 1 : 0;
    }

    _this.saveWidget = function (data) {
      _this.widget.user = _this.user._id;
      if(!data)
      {
        $scope.submitted=true
      }
      else
      {
        $scope.show_loading=true
        if (!_this.widget._id) {
        _this.createWidget();
         } else {
          $scope.show_loading_multiple=true;
        _this.updateWidget();
        _this.uploadFile(function (downloadURL) {
          _this.widget.imageUrl = downloadURL;
          _this.updateWidget();
        });
       }
      }

    };
    $scope.save_multiple_widget=function(multiple,valid)
    {
      
      if(!valid)
      {
        $scope.submitted_multiple=true;
      }
      else
      {
          if(multiple.startRange>multiple.endRange)
          {
            $scope.submitted_multiple=true;
            $scope.invalid_range=true; 
            
          }
          else
          {
           
              $scope.show_loading_multiple=true;
              multiple.user=_this.user._id
              WidgetsService.create_multiple_widget(multiple).then(function(response)
              { 
                $scope.show_loading_multiple=false;
                $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
                Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i>Multiple Widgets created successfully!', positionY: 'bottom', positionX: 'center' });
                $scope.submitted_multiple=false;
                $scope.invalid_range=false;
                $scope.multiple_widget=new Object();
                
              },function(err)
              {
                $scope.submitted_multiple=false;
                Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to create multiple widget. Please try again!', positionY: 'bottom', positionX: 'center' });

              })
           }   
      }
};

    _this.createWidget = function () {
      WidgetsService.createWidget(_this.widget).then(function (response) {
        _this.widget = response;
        $scope.submitted=false;
        $scope.show_loading=false;
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
        $scope.show_loading=false;
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Widget updated successfully!', positionY: 'bottom', positionX: 'center' });
        $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
      }, function (err) {
        console.log(err);
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to update widget. Please try again!', positionY: 'bottom', positionX: 'center' });
      });
    };

    _this.uploadFile = function (callback) {
      _this.storageObject = $firebaseStorage(_this.ref.child('images').child('widgets').child(_this.widget._id));
      if (_this.picFile === null && _this.defaultImageInBase64) {
        var uploadTask = _this.storageObject.$putString(_this.defaultImageInBase64, 'base64', { contentType: 'image/png' });
        uploadTask.$complete(function (snapshot) {
          _this.widget.imageUrl = snapshot.downloadURL;
          callback(snapshot.downloadURL);
        });
      } else if (_this.picFile) {
        Upload.base64DataUrl(_this.picFile).then(function (base64Urls) {
          var base64String = base64Urls.split(',')[1].toString();
          var uploadTask = _this.storageObject.$putString(base64String, 'base64', { contentType: _this.picFile.type });

          uploadTask.$complete(function (snapshot) {
            _this.widget.imageUrl = snapshot.downloadURL;
            callback(snapshot.downloadURL);
          });
        });
      }

    };

    _this.setLogoUrl = function () {
      if (!_this.widget._id) {
        _this.logoUrl = $window.location.origin + '/modules/core/client/img/brand/logo.png';
      } else if (_this.widget.imageUrl) {
        _this.logoUrl = $window.location.origin + '/api/widget_image/' + _this.widget._id;
      }
    };

    _this.convertRGB = function () {
      var hex = _this.widget.color.replace('#', ''),
        red = parseInt(hex.substring(0, 2), 16),
        green = parseInt(hex.substring(2, 4), 16),
        blue = parseInt(hex.substring(4, 6), 16);
      _this.rgbColor = 'Red: ' + red + ', Green: ' + green + ', Blue: ' + blue;
    };

    _this.restoreDefault = function () {
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
        var file = this.response;
        reader.readAsDataURL(file);
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
          _this.chatUrl = _this.originalUrl + '?via=email&wcode=' + _this.widget.uniqueCode;
          break;
        case 'document':
          _this.showDocument = true;
          _this.chatUrl = _this.originalUrl + '?via=document&wcode=' + _this.widget.uniqueCode;
          break;
        case 'web':
          _this.showWeb = true;
          _this.webChatUrl = _this.originalUrl + '?via=web&wcode=' + _this.widget.uniqueCode;
          break;

        default:
          _this.showEmail = true;
          _this.chatUrl = _this.originalUrl + '?via=email&wcode=' + _this.widget.uniqueCode;
          break;
      }

    };

    _this.cancel = function() {
      $state.transitionTo('widgets.list', $stateParams, { reload: true, inherit: false, notify: true });
    };

    init();


  }
}());
