(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenu('account', {
      roles: ['user']
    });

    menuService.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    menuService.addMenuItem('topbar', {
      title: 'Rooms',
      state: 'widgets.list'
    });

    // menuService.addMenuItem('topbar', {
    //   title: 'Contacts',
    //   state: 'contacts'
    // });

    // menuService.addMenuItem('topbar', {
    //   title: 'Chats',
    //   state: 'conversations.list'
    // });
    menuService.addMenuItem('topbar', {
      title: 'Staff',
      state: 'server.list'
    });
    menuService.addMenuItem('topbar', {
      title: 'Requests',
      state: 'frequentRequests.list'
    });

    // menuService.addMenuItem('topbar', {
    //   title: 'CAMPAIGNS',
    //   state: 'campaigns.list'
    // });


    // menuService.addSubMenuItem('account', 'settings', {
    //   title: 'Profile',
    //   state: 'settings.profile'
    // });

    // menuService.addSubMenuItem('account', 'settings', {
    //   title: 'Change Password',
    //   state: 'settings.password'
    // });

  }
}());
