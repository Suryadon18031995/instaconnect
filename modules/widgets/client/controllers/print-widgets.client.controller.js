(function () {
  'use strict';

  // Widgets controller
  angular
    .module('widgets')
    .controller('WidgetsPrintController', WidgetsPrintController);

  WidgetsPrintController.$inject = ['$scope', '$rootScope', '$state', '$window', 'Authentication', 'WidgetsService', 'Notification', 'FirebaseService', '$firebaseStorage', '$timeout', 'widgetSortingService', 'FrequentRequestService','OrganizationService'];

  function WidgetsPrintController($scope, $rootScope, $state, $window, Authentication, WidgetsService, Notification, FirebaseService, $firebaseStorage, $timeout, widgetSortingService, FrequentRequestService, OrganizationService) {
    var self = this;
    self.authentication = Authentication;
    self.user = self.authentication.user;
    self.parrentArrayOfWidget = [];
    self.widgets = [];
    self.assignFilter = '';
    self.getWidgets = getWidgets;
    self.requestList = [];
    self.establishment = new Object();
   
      function getWidgets()
    {    
    	getFrequentRequestList()
    	WidgetsService.getWidgetsByUser(self.user._id)
    	.then(
    			function(response)
    			{
    				self.widgets = response;
    				getEstablishment(Authentication.user.organization);
    			},
    			function(errorResponse)
    			{
    				Notification.error({ message: '<i class="glyphicon glyphicon-ok"></i> Failed to fetch the widgets!', positionY: 'bottom', positionX: 'center', replaceMessage:true });
    			}
    	);
    }
      
      function getEstablishment(organizationId) {
			OrganizationService.getOrganizationDetails(organizationId).then(function(response) {
				self.establishment = response;
			}, function(errorResponse) {
					Notification.error({ message: '<i class="glyphicon glyphicon-remove"></i> Failed fetch the establishment!', positionY: 'bottom', positionX: 'center' });				
			});
		};
    
    function getFrequentRequestList() {
        FrequentRequestService.getFrequentRequests(
            self.user._id
        ).then(function(frequentRequestList) {
            self.requestList = frequentRequestList;
        })
    };
    self.orderWidget = function (field) {
        return function (item) {
            return widgetSortingService.naturalValue(item[field]);
        }
      };
  //Print the widget preview
	self.printDiv = function(divName) {

		$timeout(function() {

			var innerContents = document.getElementById(divName).innerHTML;
			console.log(innerContents);
	        var popupWinindow = window.open('', '_blank', 'scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
	        popupWinindow.document.open();
	        popupWinindow.document.write('<html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.3/css/bootstrap-select.min.css"><link rel="stylesheet" href="/lib/bootstrap/dist/css/bootstrap.css"/><link rel="stylesheet" href="/lib/bootstrap/dist/css/bootstrap-theme.css"/><link rel="stylesheet" type="text/css" href="/modules/core/client/css/core.css" /><link rel="stylesheet" type="text/css" href="/modules/widgets/client/css/widgets.css" /><link rel="stylesheet" type="text/css" href="/modules/widgets/client/css/widget-preview-print.css" media="print"/><script type="text/javascript" src="/lib/jquery/dist/jquery.min.js"></script><script type="text/javascript" src="/lib/bootstrap/dist/js/bootstrap.js"></script></head><body onload="window.print();window.close()">' + innerContents + '</html>');
	        popupWinindow.document.close();
	         
	   }, 100);
	 };
 
  }
}())