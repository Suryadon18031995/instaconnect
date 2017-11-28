(function () {
  'use strict';

  // Widgets controller
  angular
    .module('widgets')
    .controller('WidgetsController', WidgetsController);

  WidgetsController.$inject = ['$scope', '$rootScope', '$state', '$window', 'Authentication', 'WidgetsService', 'Notification', 'FirebaseService', '$firebaseStorage', '$timeout', 'widgetSortingService'];

  function WidgetsController($scope, $rootScope, $state, $window, Authentication, WidgetsService, Notification, FirebaseService, $firebaseStorage, $timeout, widgetSortingService) {
    var _this = this;
    _this.authentication = Authentication;
    _this.user = _this.authentication.user;
    _this.parrentArrayOfWidget = [];
    _this.widgets = [];
    _this.assignFilter = '';
    _this.exportData = exportData;
  
      
    _this.widgetsInitFunction = function () {
        _this.getWidgets();
        FirebaseService.saveUserInDB(Authentication.user, 'offline');
    };

  
    _this.deleteWidget = function() {
      WidgetsService.deleteWidget(_this.selectedWidgetId).then(function(response) {
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Widget deleted successfully!', positionY: 'bottom', positionX: 'center' });
        _this.getWidgets();
      }, function(errorResponse) {
        Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to delete the widget!', positionY: 'bottom', positionX: 'center' });
      });
    };
    
     function exportData(rooms) {
             console.log(rooms);
             var fileName = "rooms.xlsx";
             alasql('SELECT widgetName as RoomName,conversationCode as UniqueCode INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [rooms]);
  };
    

    _this.getWidgets = function() {
      WidgetsService.getWidgetsByUser(_this.user._id).then(function (response) {
        $timeout(function() {
          _this.parrentArrayOfWidget = response;
          _this.widgets = response;
          _this.assignFilter = 'All';fi
        }, 0);
      }, function (errorResponse) {
        Notification.error({ message: '<i class="glyphicon glyphicon-ok"></i> Failed to fetch the widgets!', positionY: 'bottom', positionX: 'center', replaceMessage:true });
      });
    };

    _this.selectWidget = function(widgetId) {
      _this.selectedWidgetId = widgetId;
    };

    _this.setInstructions = function(value) {
      $rootScope.showInstructions = value;
    };

    _this.setId = function(id){
            $stateParams.widgetId = id

    };
    _this.orderWidget = function (field) {
      return function (item) {
          return widgetSortingService.naturalValue(item[field]);
      }
    };

    _this.setFilter = function (filterString) {
        if(filterString == 'All') {
          _this.widgets = [];
          _this.widgets = _this.parrentArrayOfWidget;
        } else {
            if(filterString == 'Unassigned') {
             $timeout(function() {
                _this.widgets = [];
                angular.forEach(_this.parrentArrayOfWidget, function(widget, index) {
                    if(!widget.assignedTo || widget.assignedTo == {}) {
                        _this.widgets.push(widget);
                    }
                })
            }, 0);
          } else {
                $timeout(function() {
                  _this.widgets = [];
                  angular.forEach(_this.parrentArrayOfWidget, function(widget, index) {
                      if(widget.assignedTo) {
                          _this.widgets.push(widget);
                      }
                  })
              }, 0);
          }
        }
    }
   
  }
}());
