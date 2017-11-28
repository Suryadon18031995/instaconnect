(function (app) {
  'use strict';

  app.registerModule('chats');
  app.registerModule('chats.routes', ['ui.router']);
}(ApplicationConfiguration));
