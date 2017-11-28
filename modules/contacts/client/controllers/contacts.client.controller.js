(function () {
  'use strict';

  angular
    .module('contacts')
    .controller('ContactsController', ContactsController);

  ContactsController.$inject = ['$scope', 'Authentication', 'ContactsService', 'FirebaseService'];

  function ContactsController($scope, Authentication, ContactsService, FirebaseService) {
    var _this = this;
    _this.contacts = null;
    _this.selectedContact = null;

    // Contacts controller logic
    // ...
    function init() {
      _this.isLoading = true;
      FirebaseService.saveUserInDB(Authentication.user, 'offline');
      _this.getContacts();
    }

    _this.getContacts = function () {
      ContactsService.getContacts(Authentication.user._id).then(function (response) {
        _this.isLoading = false;
        _this.contacts = response;
        _this.selectedContact = _this.contacts.length >= 1 ? _this.contacts[0] : null;
        if (_this.contacts.length === 0) {
          _this.contacts = null;
        }
      }, function (error) {
        console.info(error);
      });
    };

    _this.showContactDetails = function(contact) {
      _this.selectedContact = contact;
    };

    init();
  }
}());

