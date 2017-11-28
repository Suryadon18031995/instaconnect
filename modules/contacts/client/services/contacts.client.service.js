'use strict';

angular.module('contacts').service('ContactsService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.getContacts = function(userId) {
      return Restangular.one('api/contacts', userId).getList();
    };
  }
]);
