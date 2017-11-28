(function () {
  'use strict';

  angular
    .module('campaigns')
    .controller('CampaignsListController', CampaignsListController);

  CampaignsListController.$inject = ['CampaignsService', 'WidgetsService', 'Authentication', 'Notification', '$window', 'Upload', '$firebaseStorage', 'FirebaseService'];


  function CampaignsListController(CampaignsService, WidgetsService, Authentication, Notification, $window, Upload, $firebaseStorage, FirebaseService) {
    var _this = this;
    _this.user = Authentication.user;
    _this.dropDownWidget = '-1';
    _this.showWidgetPreview = false;
    _this.showCodePreview = false;

    function init() {
      _this.getWidgets();
      _this.getCampaigns();
      FirebaseService.getStorageRef(_this.user, function (ref) {
        _this.ref = ref;
      });
    }

    _this.getWidgets = function () {
      WidgetsService.getWidgetsByUser(_this.user._id).then(function (response) {
        _this.widgets = response;
      }, function (errorResponse) {
        console.log(errorResponse);
      });
    };

    _this.createCampaign = function () {
      var campaign = {
        name: _this.campaignName,
        widget: _this.dropDownWidget
      };

      _this.selectedWidgetError = _this.dropDownWidget === '-1';
      _this.campaignNameError = _this.campaignName === '' || _this.campaignName === undefined;

      if (_this.selectedWidgetError || _this.campaignNameError) {
        return;
      }

      CampaignsService.createCampaign(campaign).then(function (response) {
        angular.element('#create-campaign-modal').modal('hide');
        _this.getCampaigns();
        _this.resetForm();
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Campaign created successfully!', positionY: 'bottom', positionX: 'center' });
      }, function (err) {
        console.log(err);
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to create campaign. Please try again!', positionY: 'bottom', positionX: 'center' });
      });
    };

    _this.resetForm = function () {
      _this.campaignName = '';
      _this.selectedWidget = '-1';
      _this.selectedWidgetError = false;
      _this.campaignNameError = false;
    };

    _this.getCampaigns = function () {
      CampaignsService.getCampaigns().then(function (response) {
        _this.campaigns = response;
      }, function (err) {
        console.log(err);
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Error while getting the campaigns from server!', positionY: 'bottom', positionX: 'center' });
      });
    };

    _this.loadWidget = function (campaign) {
      _this.showWidgetPreview = true;
      _this.selectedWidget = campaign.widget;
    };

    _this.codePreview = function (campaign) {
      _this.showWidgetPreview = true;
      _this.codePreviewId = campaign._id;
      _this.selectedWidget = campaign.widget;
      _this.showEmail = true;
      _this.showDocument = false;
      _this.showWeb = false;

      var hex = _this.selectedWidget.color.replace('#', ''),
        red = parseInt(hex.substring(0, 2), 16),
        green = parseInt(hex.substring(2, 4), 16),
        blue = parseInt(hex.substring(4, 6), 16);
      _this.rgbColor = 'Red: ' + red + ', Green: ' + green + ', Blue: ' + blue;

      _this.logoUrl = $window.location.origin + '/api/widget_image/' + _this.selectedWidget._id;
      if (_this.user.userName) {
        _this.chatUrl = $window.location.origin + '/' + _this.user.userName + '/talk?via=email&uc=' + campaign.uniqueCode;
        _this.originalUrl = $window.location.origin + '/' + _this.user.userName + '/talk';
      } else {
        _this.chatUrl = $window.location.origin + '/' + _this.user._id + '/talk?via=email&uc=' + campaign.uniqueCode;
        _this.originalUrl = $window.location.origin + '/' + _this.user._id + '/talk';
      }
    };

    _this.hideCodePreview = function () {
      _this.codePreviewId = undefined;
    };

    _this.showDocumentDetails = function (documentType, campaign) {
      switch (documentType) {
        case 'mail':
          _this.showEmail = true;
          _this.showDocument = false;
          _this.showWeb = false;
          _this.chatUrl = _this.originalUrl + '?via=email&uc=' + campaign.uniqueCode;
          break;
        case 'document':
          _this.showEmail = false;
          _this.showDocument = true;
          _this.showWeb = false;
          _this.chatUrl = _this.originalUrl + '?via=document&uc=' + campaign.uniqueCode;
          break;
        case 'web':
          _this.showEmail = false;
          _this.showDocument = false;
          _this.showWeb = true;
          _this.chatUrl = _this.originalUrl + '?via=web&uc=' + campaign.uniqueCode;
          break;

        default:
          _this.showEmail = true;
          _this.showDocument = false;
          _this.showWeb = false;
          break;
      }
    };

    _this.saveWidget = function () {
      _this.selectedWidget.user = _this.user._id;

      if (_this.picFile) {
        _this.uploadFile(function (downloadURL) {
          _this.updateWidget();
        });
      } else {
        // _this.widget.imageUrl = _this.logoUrl;
        _this.updateWidget();
      }
    };

    _this.updateWidget = function () {
      WidgetsService.updateWidget(_this.selectedWidget._id, _this.selectedWidget).then(function (response) {
        _this.selectedWidget = response;
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Signature updated successfully!', positionY: 'bottom', positionX: 'center' });
        angular.element('#customize-widget-modal').modal('hide');
      }, function (err) {
        console.log(err);
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to update signature. Please try again!', positionY: 'bottom', positionX: 'center' });
      });
    };

    _this.uploadFile = function (callback) {
      _this.storageObject = $firebaseStorage(_this.ref.child('images').child('widgets').child(_this.selectedWidget._id));

      if (_this.picFile === null && _this.defaultImageInBase64) {
        var uploadTask = _this.storageObject.$putString(_this.defaultImageInBase64, 'base64', { contentType: 'image/png' });
        uploadTask.$complete(function (snapshot) {
          _this.selectedWidget.imageUrl = snapshot.downloadURL;
          callback(snapshot.downloadURL);
        });
      } else {
        Upload.base64DataUrl(_this.picFile).then(function (base64Urls) {
          var base64String = base64Urls.split(',')[1].toString();
          var uploadTask = _this.storageObject.$putString(base64String, 'base64', { contentType: _this.picFile.type });

          uploadTask.$complete(function (snapshot) {
            _this.selectedWidget.imageUrl = snapshot.downloadURL;
            callback(snapshot.downloadURL);
          });
        });
      }
    };

    init();
  }
}());
