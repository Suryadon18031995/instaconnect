

(function () {
	'use strict';
	angular
		.module('widgets')
		.controller('WidgetsPreviewController', WidgetsPreviewController);
	WidgetsPreviewController.$inject = ['$scope', '$rootScope', '$state', '$window', 'Authentication', 'WidgetsService', 'Notification', 'FirebaseService', '$firebaseStorage', '$log', '$stateParams','OrganizationService', '$location', '$timeout', 'widgetInfo', 'FrequentRequestService']

	function WidgetsPreviewController($scope, $rootScope, $state, $window, Authentication, WidgetsService, Notification, FirebaseService, $firebaseStorage, $log, $stateParams, OrganizationService, $location, $timeout, widgetInfo, FrequentRequestService) {
		var _this = this
		_this.authentication = Authentication;
		_this.user = _this.authentication.user;
		_this.authentication = Authentication;
		_this.user = _this.authentication.user;
		_this.preview = new Object();
		_this.widget = new Object();
		var requestList = new Array();
		_this.establishment = new Object();
		_this.getFrequentRequestList = getFrequentRequestList;
		//_this.getDetailsForPreview = getDetailsForPreview;
		var log = $log.log;
		
		function getFrequentRequestList() {
	            FrequentRequestService.getFrequentRequests(
	                _this.user._id
	            ).then(function(frequentRequestList) {
	                requestList = frequentRequestList;
	                getDetailsForPreview();
	            })
	        };

		function getDetailsForPreview() {
			$('li#widgets').addClass('active');
			//getFrequentRequestList()
			if (!_this.user) {

				$state.transitionTo('home',{reload:true, inherit: true, notify:true});
				
			} else {

				if(Authentication.user.organization) {
					_this.getEstablishment(Authentication.user.organization);
				} else {
					_this.getPreview();
				}
				
				if ($stateParams.widgetId) {
					_this.setReadOnly = true;
					_this.widget = widgetInfo;
					_this.widget.requestList = new Array();
					_this.widget.requestList = requestList;
				}

			}
			
		};
		
		
		//Getting establishment detail
		_this.getEstablishment = function (organizationId) {
			OrganizationService.getOrganizationDetails(organizationId).then(function(response) {
				_this.establishment = response;
				_this.getPreview();
			}, function(errorResponse) {
					Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed fetch the establishment!', positionY: 'bottom', positionX: 'center' });				
			});
		};
		
		
	
		//Get preview data
		_this.getPreview = function () {
			WidgetsService.getPreviewById({ _id: _this.user._id }).then(function (response) {
				if (response.data.length) {
					_this.preview = response.data[0]
				} else {
					_this.preview.text = 'To get immediate attention from your server, please go to instaconnect.com and enter the code below or scan the QR code and choose any of the options below'

				}
			}, function (err) {
					Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to fetch widget preview design!', positionY: 'bottom', positionX: 'center' });				
			});
		};

		//save the printText for widget
		_this.savePreview = function (data) {
			if (_this.preview._id) {
				WidgetsService.updatePreview(_this.preview).then(function (response) {
					Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Preview Updated successfully!', positionY: 'bottom', positionX: 'center' });

				})
			} else {
				_this.preview.userId = _this.user._id
				WidgetsService.savePreview(_this.preview).then(function (saved) {
					Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Preview saved successfully!', positionY: 'bottom', positionX: 'center' });


				}, function (err) {
					Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed to save preview successfully!', positionY: 'bottom', positionX: 'center' });
				})
			}

		}

		//Print the widget preview
		_this.printDiv = function(divName) {

			$timeout(function() {

				var innerContents = document.getElementById(divName).innerHTML;
		        var popupWinindow = window.open('', '_blank', 'scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
		        popupWinindow.document.open();
		        popupWinindow.document.write('<html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.3/css/bootstrap-select.min.css"><link rel="stylesheet" href="/lib/bootstrap/dist/css/bootstrap.css"/><link rel="stylesheet" href="/lib/bootstrap/dist/css/bootstrap-theme.css"/><link rel="stylesheet" type="text/css" href="/modules/core/client/css/core.css" /><link rel="stylesheet" type="text/css" href="/modules/widgets/client/css/widgets.css" /><link rel="stylesheet" type="text/css" href="/modules/widgets/client/css/widget-preview-print.css" media="print"/><script type="text/javascript" src="/lib/jquery/dist/jquery.min.js"></script><script type="text/javascript" src="/lib/bootstrap/dist/js/bootstrap.js"></script></head><body onload="window.print();window.close()">' + innerContents + '</html>');
		        popupWinindow.document.close();
		         
		   }, 100);
		 };


	}
}())