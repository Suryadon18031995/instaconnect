(function() {
    'use strict';

    angular
        .module('frequentRequest')
        .controller('frequentRequestController', frequentRequestController);

    frequentRequestController.$inject = ['$scope', '$http', '$state', '$stateParams', '$window', 'Authentication', 'Upload', '$timeout', 'Notification', '$uibModal', 'FirebaseService', '$firebaseStorage', 'InvitationService', '$base64', 'Restangular', '$interval', '$log', '$rootScope', 'FrequentRequestService', 'waiterService'];

    function frequentRequestController($scope, $http, $state, $stateParams, $window, Authentication, Upload, $timeout, Notification, $uibModal, FirebaseService, $firebaseStorage, InvitationService, $base64, Restangular, $interval, $log, $rootScope, FrequentRequestService, waiterService) {
        var _this = this;
        _this.authentication = Authentication;
        _this.user = _this.authentication.user;
        _this.request = new Object();
        _this.requestList = new Array();
        _this.selectedRequestId = '';
        _this.modalInstance = '';
        _this.requestObjectForEdit = {};
        _this.waiters = new Array();
        _this.getStaff = getStaff;
        var log = $log.log;
        
        $scope.myConfig = {
        	    create: true,
        	    onChange: function(value){
        	      console.log('onChange', value)
        	    },
        	    // maxItems: 1,
        	    required: true,
        	  }
        
        function getStaff()
        {
        	waiterService.getWaiters(_this.user._id)
            .then(
            		function(waiters)
            		{
            			if(waiters != null && waiters.length > 0)
            			{
            				_this.waiters = waiters;
            				_this.request.staffList = new Array();
            			}
            			else
            			{
            				Notification.error({ message: '<i class="glyphicon glyphicon-ok"></i> No staff Found!', positionY: 'bottom', positionX: 'center' });
            			}
            		},
            		function(err)
            		{
            			Notification.error({ message: '<i class="glyphicon glyphicon-ok"></i> Failed to fetch the staff!', positionY: 'bottom', positionX: 'center' });
            		}
            );
        }
        
        _this.getFireBaseStorageReference = function() {
            if(!_this.user) {
                $state.transitionTo('home', $stateParams, {
                reload: true,
                inherit: false,
                notify: true
                });
            }
            FirebaseService.getStorageRef(_this.user, function(ref) {
                _this.ref = ref;
            });
            _this.editModeRequest = false;
            _this.request.ownerId = _this.user._id;
            _this.getFrequentRequestList();
        };
        
        $scope.onDrop = function(srcList, srcIndex, targetList, targetIndex) {
            // Copy the item from source to target.
        	console.log(srcList[srcIndex]);
        	
            targetList.splice(targetIndex, 0, srcList[srcIndex]);
            // Remove the item from the source, possibly correcting the index first.
            // We must do this immediately, otherwise ng-repeat complains about duplicates.
            if (srcList == targetList && targetIndex <= srcIndex) srcIndex++;
            srcList.splice(srcIndex, 1);
            
            var exIndex = srcList[srcIndex].positionId;
            _this.selectedRequestIndex = srcIndex;
        	srcList[srcIndex].positionId = srcList[targetIndex].positionId;
        	_this.request = angular.copy(srcList[srcIndex]);
        	updateDragRequest();
            
            _this.selectedRequestIndex = targetIndex;
        	srcList[targetIndex].positionId = exIndex;
        	_this.request = angular.copy(srcList[targetIndex]);
        	updateDragRequest();
            // By returning true from dnd-drop we signalize we already inserted the item.
            return true;
          };
          
          function updateDragRequest() {
              FrequentRequestService.updateFrequentRequest(_this.request).then(function (response) {
                  _this.editModeRequest = !_this.editModeRequest;
                  angular.extend(_this.requestList[_this.selectedRequestIndex], _this.requestObjectForEdit);
                  _this.requestObjectForEdit = {};
                  _this.submitted = !_this.submitted;
                  /*Notification.success({
                          message: '<i class="glyphicon glyphicon-ok"></i> Drag Request updated successfully',
                          positionY: 'bottom',
                          positionX: 'center'
                      });*/
              },function (err) {
                  Notification.error({
                          message: '<i class="glyphicon glyphicon-remove"></i> '+err.message,
                          positionY: 'bottom',
                          positionX: 'center'
                      });
   
              })
          }
        
        _this.getFrequentRequestList = function() {
            FrequentRequestService.getFrequentRequests(
                _this.user._id
            ).then(function(frequentRequestList) {
                _this.requestList = frequentRequestList;
                _this.editModeRequest = false;
            })
        };

        _this.addRequest = function(formValid) {
        	if(_this.request.staffList.length >=  0)
        	{
        		_this.request.routingType = 'staffroute';
        	}
            if(formValid) {
                    angular.element('#myModal').modal('hide');
                    if(_this.editModeRequest) {

                        _this.updateRequest();

                    }else {

                        _this.request.ownerId = _this.user._id;
                        _this.request.positionId = _this.requestList.length;
                        FrequentRequestService.addFrequentRequest(_this.request).then(function(request) {
                            if (request) {
                                _this.getFrequentRequestList();
                                _this.request = {};
                                _this.submitted = ! _this.submitted;
                                Notification.success({
                                    message: '<i class="glyphicon glyphicon-ok"></i> Request added successfully',
                                    positionY: 'bottom',
                                    positionX: 'center'
                                });

                            }

                        }, function(err) {
                            Notification.error({
                                message: '<i class="glyphicon glyphicon-remove"></i> '+err.message,
                                positionY: 'bottom',
                                positionX: 'center'
                            });

                        });
                    }
            }else {
                log("form is not valid")
            }
            
        };

        _this.setDataForEdit = function (request) {
            _this.editModeRequest = !_this.editModeRequest;
            _this.selectedRequestIndex = _this.requestList.indexOf(request);
            _this.requestObjectForEdit = angular.copy(request);
            _this.request = _this.requestObjectForEdit;
            _this.request.staffList = new Array();
        }
        _this.updateRequest = function() {
            FrequentRequestService.updateFrequentRequest(_this.request).then(function (response) {
                _this.editModeRequest = !_this.editModeRequest;
                angular.extend(_this.requestList[_this.selectedRequestIndex], _this.requestObjectForEdit);
                _this.requestObjectForEdit = {};
                _this.submitted = !_this.submitted;
                Notification.success({
                        message: '<i class="glyphicon glyphicon-ok"></i> Request updated successfully',
                        positionY: 'bottom',
                        positionX: 'center'
                    });
            },function (err) {
                Notification.error({
                        message: '<i class="glyphicon glyphicon-remove"></i> '+err.message,
                        positionY: 'bottom',
                        positionX: 'center'
                    });
 
            })
        }
        _this.setFrequentRequest = function(frequentRequest){
            frequentRequest.isSelected = frequentRequest.isSelected ? false : true;
            FrequentRequestService.setFrequentRequestSelected(frequentRequest._id,frequentRequest).then(function (response){
                _this.getFrequentRequestList();
            }, function(err) {
                Notification.error({
                        message: '<i class="glyphicon glyphicon-remove"></i>' + err.message,
                        positionY: 'bottom',
                        positionX: 'center'
                    });
            });
        };



        _this.selectedFrequentRequest = function(frequentRequestId){
            _this.selectedRequestId = frequentRequestId;
        };

        _this.deleteFrequentRequest = function(){
            FrequentRequestService.deleteFrequentRequest(_this.selectedRequestId).then(function (response){
                _this.getFrequentRequestList();
                Notification.success({
                            message: '<i class="glyphicon glyphicon-ok"></i> Request deleted successfully',
                            positionY: 'bottom',
                            positionX: 'center'
                        });
            }, function(err) {
                Notification.error({
                        message: '<i class="glyphicon glyphicon-remove"></i>' + err.message,
                        positionY: 'bottom',
                        positionX: 'center'
                    });
            });
        };

        _this.uploadRequestImage = function(logo, es) {

            if (_this.requestImage) {
                if (_this.requestImage.type.split('/')[0] == 'image') {
                    var firebaseImagePath = "images/frequentRequest";
                    var imageName = firebaseImagePath + "/" + Date.now() + "." + _this.requestImage.type.split('image/')[1];
                    _this.storageObject = $firebaseStorage(_this.ref.child(imageName));
                    Upload.base64DataUrl(_this.requestImage).then(function(base64Urls) {
                        var base64String = base64Urls.split(',')[1].toString();
                        var uploadTask = _this.storageObject.$putString(base64String, 'base64', {
                            contentType: _this.requestImage.type
                        });
                        uploadTask.$complete(function(snapshot) {
                            _this.request.imageUrl = snapshot.downloadURL;
                        });
                    });
                } else {
                    Notification.error({
                        message: '<i class="glyphicon glyphicon-remove"></i> Please select image file',
                        positionY: 'bottom',
                        positionX: 'center'
                    });

                }

            } else {
                Notification.error({
                    message: '<i class="glyphicon glyphicon-remove"></i> Please select image file',
                    positionY: 'bottom',
                    positionX: 'center'
                });
            }

        };
    };
}());