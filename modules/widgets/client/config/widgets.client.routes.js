(function () {
  'use strict';

  angular
    .module('widgets')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('widgets', {
        abstract: true,
        url: '/widgets',
        template: '<ui-view/>'
      })
      .state('widgets.list', {
        url: '',
        templateUrl: 'modules/widgets/client/views/widgets.client.view.html',
        controller: 'WidgetsController',
        controllerAs: 'widgetsController',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Widgets'
        }
      })
      
       
      
      .state('widgets.printData', {
        url: '/:widgetId/printData',
        templateUrl: 'modules/widgets/client/views/print.view.html',
        controller: 'WidgetsPrintController',
        controllerAs: 'WidgetsPrintController',
        resolve: {
          widgetResolve: getWidget
        },
        data: {
          roles: ['user', 'admin']
        }
      })
          
      // .state('widgets.create', {
      //   url: '/create',
      //   templateUrl: 'modules/widgets/client/views/create-widgets.client.view.html',
      //   controller: 'CreateWidgetController',
      //   controllerAs: 'createWidgetController',
      //   data: {
      //     roles: ['user', 'admin']
      //   }
      // })
      .state('widgets.edit', {
        url: '/:widgetId/createUpdate',
        templateUrl: 'modules/widgets/client/views/edit-widgets.client.view.html',
        controller: 'EditWidgetController',
        controllerAs: 'editWidgetController',
        resolve: {
          widgetResolve: getWidget
        },
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('widget-not-found', {
        url: '/widget-not-found',
        templateUrl: 'modules/widgets/client/views/widget-not-found.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Widget Not Found'
        }
      })
      .state('widgets.preview', {
        url: '/preview',
        templateUrl: 'modules/widgets/client/views/widget-preview.client.view.html',
        controller: 'WidgetsPreviewController',
        controllerAs: 'WidgetsPreviewController',
        resolve: {
          widgetInfo: setNullValuesForPreview
        },
        data: {
          roles: ['user', 'admin'],

        }
      })
      .state('widgets.Print', {
        url: '/print/:widgetId',
        templateUrl: 'modules/widgets/client/views/widget-preview.client.view.html',
        controller: 'WidgetsPreviewController',
        controllerAs: 'WidgetsPreviewController',
        resolve: {
          widgetInfo: getWidget
        },
        data: {
          roles: ['user', 'admin']
        },
          deepStateRedirect: true,
          sticky: true,
      });
  }

  getWidget.$inject = ['$stateParams', 'WidgetsService'];

  function getWidget($stateParams, WidgetsService) {
    return WidgetsService.getWidgetById($stateParams.widgetId);
  }
function setNullValuesForPreview () {
  return null;
}
  newWidget.$inject = ['WidgetsService'];

  function newWidget(WidgetsService) {
    return new WidgetsService();
  }
}());
