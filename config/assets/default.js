'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.css',
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/simple-line-icons/css/simple-line-icons.css',
        'public/lib/angular-bootstrap-colorpicker/css/colorpicker.min.css',
        'public/lib/prism/themes/prism-coy.css',
        'public/lib/angular-google-places-autocomplete/src/autocomplete.css',
        'public/lib/selectize/dist/css/selectize.default.css',
        'modules/core/client/css/qr.css',
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/jquery/dist/jquery.js',        
        'public/lib/angular/angular.js',
        'public/lib/bootstrap/dist/js/bootstrap.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/ng-file-upload/ng-file-upload.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-mocks/angular-mocks.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/lodash/lodash.js',
        'public/lib/restangular/dist/restangular.min.js',
        'public/lib/firebase/firebase.js',
        'public/lib/angularfire/dist/angularfire.min.js',
        'public/lib/angular-local-storage/dist/angular-local-storage.min.js',
        'public/lib/moment/min/moment.min.js',
        'public/lib/angular-moment/angular-moment.min.js',
        'public/lib/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
        'public/lib/prism/prism.js',
        'public/lib/ngclipboard/dist/ngclipboard.min.js',
        'public/lib/angular-base64/angular-base64.min.js',
        'public/lib/angular-highlightjs/angular-highlightjs.min.js',
        'public/lib/angular-smart-table/dist/smart-table.min.js',
        'public/lib/angular-spinner/dist/angular-spinner.min.js',
        'public/lib/ngAutocomplete.js',
        'public/lib/angular-message.js' ,
        'public/lib/angular-google-places-autocomplete/src/autocomplete.js',
        'public/lib/angular-selectize2/dist/angular-selectize.js',
        'public/lib/selectize/dist/js/selectize.js',
        'public/lib/selectize/dist/js/standalone/selectize.min.js',
        'public/lib/ngSantize/santize.js',
        'modules/core/client/webcam.directive.js',
        'modules/core/client/br-code-reader.directive.js',
        'modules/chats/client/directives/angular-fullscreen.js',
        'public/lib/ngMask/dist/ngMask.min.js',
        'public/lib/angular-ui-mask/dist/mask.js'
        // endbower
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    img: [
      'modules/**/*/img/**/*.jpg',
      'modules/**/*/img/**/*.png',
      'modules/**/*/img/**/*.gif',
      'modules/**/*/img/**/*.svg'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: ['modules/*/server/config/*.js'],
    policies: 'modules/*/server/policies/*.js',
    views: ['modules/*/server/views/*.html']
  }
};
