'use strict';

angular.module('Waiter').service('waiterService', ['Restangular',
	function (Restangular) {
		var _this = this;
		_this.addWaiter = function (data) {
			return Restangular.all('api/waiter').post(data);
		};	
		_this.deleteWaiter = function (data) {
			return Restangular.all('api/waiter/'+data._id).all(data.organization).customDELETE();
		};
		_this.getWaiters = function (data) {
			return Restangular.all('api/getWaiterList').all(data).getList();
		};
		_this.updateWaiter = function (data) {
			return Restangular.all('api/waiter/').all(data._id).customPUT(data);
		};
		_this.getWaiterById = function (data) {
			return Restangular.all('api/waiter').one(data._id).get();
		};
		_this.updateWaiterWidgets = function (data) {
			return Restangular.all('api/updateWaiterWidgets/').one(data.server._id).customPUT(data);
		};
		_this.deleteWaiterWidgets = function (data) {
			return Restangular.all('api/deleteWaiterWidgets/').one(data.server._id).customPUT(data);
		};

		_this.findWidgetsById = function (data) {
			return Restangular.all('api/getWidgetListById').one(data).get();
		};
		_this.findUnAssignedWidgets = function(id){
			return Restangular.all('api/findUnAssingedWidgets').all(id).getList();
		}
	}
]);
