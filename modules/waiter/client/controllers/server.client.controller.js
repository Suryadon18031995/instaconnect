
(function () {
    'use strict';

    angular
        .module('Waiter')
        .controller('serverController', serverController);

    serverController.$inject = ['$scope', '$http', '$state', '$stateParams', '$window', 'Authentication', 'Upload', '$timeout', 'Notification', '$uibModal', 'FirebaseService', '$firebaseStorage', 'InvitationService', '$base64', 'Restangular', '$interval', '$log', 'waiterService', 'WidgetsService', '$rootScope'];

    function serverController($scope, $http, $state, $stateParams, $window, Authentication, Upload, $timeout, Notification, $uibModal, FirebaseService, $firebaseStorage, InvitationService, $base64, Restangular, $interval, $log, waiterService, WidgetsService, $rootScope) {
        var _this = this;
        _this.authentication = Authentication;
        _this.user = _this.authentication.user;
        _this.currentIndexWaiter = null;
        _this.selectedServerIndex = -1;
        _this.widgetList = new Array();
        var log = $log.log;
        _this.selectedArray = [];
        _this.parentArrayOfWidgets = [];
        _this.serverSelectizeConfig = {};
        _this.serverSelectedIndex = -1;
        _this.firstTimeLoadingFlag = true;

        //spinnerState 0:hide 1:loading 2:done
        _this.spinnerState = [];
        _this.serverIdArray = [];

        _this.genServerSelectizeConfig = function (server) {
            _this.serverSelectizeConfig[server._id] = {
                create: false,
                valueField: '_id',
                labelField: 'widgetName',
                searchField: 'widgetName',
                delimiter: '|',
                placeholder: 'Assign Widgets',
                preload: 'focus',
                hideSelected: true,
                // items:
                onItemAdd: function (value) {
                    if (_this.selectedArray.indexOf(value) === -1) {
                        _this.selectedArray.push(value);
                    }
                    _this.getWidgetIndex(value, server,true);
                },

                onItemRemove: function (value) {
                    var index = _this.selectedArray.indexOf(value);
                    _this.selectedArray.splice(index, 1);
                    _this.getWidgetIndex(value, server,false);
                },

                onFocus: function (value) {
                    var index = _this.serverList.indexOf(server);
                    _this.setIndexOfWaiter(server);
                    _this.firstTimeLoadingFlag = false;

                },
            }
        }

        _this.waiterInitFunction = function () {
            if (!_this.user) {
                $state.transitionTo('home', $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });

            } else {

                waiterService.getWaiters(
                    _this.user._id
                ).then(function (waiters) {

                        _this.serverList = waiters;

                        angular.forEach(_this.serverList, function (server, index) {
                            if (server.widgetsAssigned) {
                                angular.forEach(server.widgetsAssigned, function (widgetId, widgetIndex) {
                                    _this.selectedArray.push(widgetId)
                                })
                            }
                        });

                         for (var i = 0; i < _this.serverList.length; i++) {
                            _this.genServerSelectizeConfig(_this.serverList[i]);
                            _this.spinnerState.push(0);
                            _this.serverIdArray.push(_this.serverList[i]._id);
                        }

                        waiterService.findWidgetsById(
                            _this.user._id
                        ).then(function (widgets) {
                            _this.parentArrayOfWidgets = widgets.data;
                            
                            angular.forEach(_this.serverList, function (server, serverIndex) {
                                angular.forEach(_this.parentArrayOfWidgets, function (widget, widgetindex) {
                                    _this.widgetList[server._id].push(widget);
                                });
                            })
                        }, function (err) {
                                Notification.error({ message: '<i class="glyphicon glyphicon-ok"></i> Failed to fetch the rooms!', positionY: 'bottom', positionX: 'center' });
                            
                        });
                },function(err){
                    Notification.error({ message: '<i class="glyphicon glyphicon-ok"></i> Failed to fetch the staffs!', positionY: 'bottom', positionX: 'center' });
                });
            }
        };

        _this.selectWaiter = function(data) {
            _this.selectedServerData = data
        }

        _this.deleteWaiter = function (data) {
            waiterService.deleteWaiter(_this.selectedServerData).then(function (waiterlist) {
                if (waiterlist) {
                    _this.serverList = waiterlist
                    Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Staff deleted successfully', positionY: 'bottom', positionX: 'center' });
                    _this.updateSelectedArray();

                }
                else {
                     _this.selectedServerData = null;
                }
                _this.currentIndexWaiter = null;
            }, function (err) {
                Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to delete staff', positionY: 'bottom', positionX: 'center' });
            })

        }

        _this.setIndexOfWaiter = function (waiter) {
            $timeout(function () {
                var loadedWidgets = _.filter(_this.parentArrayOfWidgets, function (widg) {
                    return _this.selectedArray.indexOf(widg._id) === -1 || waiter.widgetsAssigned.indexOf(widg._id) !== -1;
                });
                _this.widgetList[waiter._id] = [];
                _this.widgetList[waiter._id] = loadedWidgets;
            }, 0);
        }

        _this.getWidgetIndex = function (id, server, flag) {
            angular.forEach(_this.parentArrayOfWidgets, function (widget, widgetIndex) {
                if (id === widget._id) {
                    if (flag) {
                        _this.addWidgetToWaiter(widget, server);
                    } else {
                        _this.removeWidgetFromWaiter(widget, server);
                    }
                }
            })
        }


        _this.addWidgetToWaiter = function (widget,server) {
            if (!_this.firstTimeLoadingFlag) {
                var index = _this.serverIdArray.indexOf(server._id);
                _this.showLoading(index);
                waiterService.updateWaiterWidgets({ server: server, widgetId: widget._id }).then(function (response) {
                    // Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> ' + widget.widgetName + ' assigned to ' +_this.currentIndexWaiter.displayName + ' successfully', positionY: 'bottom', positionX: 'center' });
                    _this.showSuccessCheck(index);
                }, function (err) {
                    _this.hideLoading(index);
                    Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to assinged '+ widget.widgetName + ' to '+ server.displayName, positionY: 'bottom', positionX: 'center' });
                    log(err);
                })
            }
        };

        _this.removeWidgetFromWaiter = function (widget,server) {
            if (!_this.firstTimeLoadingFlag) {
                var index = _this.serverIdArray.indexOf(server._id);
                _this.showLoading(index);
                waiterService.deleteWaiterWidgets({ server: server, widgetId: widget._id }).then(function (response) {
                    // Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> ' + widget.widgetName + ' unassigned to ' +_this.currentIndexWaiter.displayName + ' successfully', positionY: 'bottom', positionX: 'center' });
                    _this.showSuccessCheck(index);
                }, function (err) {
                    _this.hideLoading(index);
                    Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to assinged '+ widget.widgetName + ' to '+ server.displayName, positionY: 'bottom', positionX: 'center' });
                    log(err);
                })

            }
        };

        _this.updateSelectedArray = function () {
            if(_this.selectedServerData.widgetsAssigned.length) {
                $timeout(function () {
                    var selectedWidgets = _.filter(_this.selectedArray, function (widgetId) {
                        return _this.selectedServerData.widgetsAssigned.indexOf(widgetId) === -1 ;
                    });
                    _this.selectedArray = [];
                    _this.selectedArray = selectedWidgets;
                    _this.selectedServerData = null;
                }, 0);
            }
        }

        _this.showLoading = function (index) {
            $timeout(function() {
                _this.spinnerState[index] = 1;
            }, 0);
        }

        _this.showSuccessCheck = function (index) {
            $timeout(function() {
                _this.spinnerState[index] = 2;
                $timeout(function() {
                    _this.spinnerState[index] = 0;
                }, 2000);
            },0);
        }

        _this.hideLoading = function (index) {
            $timeout(function() {
                _this.spinnerState[index] = 0;
            }, 0);
        }
    }
}());
