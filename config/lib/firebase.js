'use strict';

var config = require('../config'),
  path = require('path'),
  _this = this,
  firebase = require('firebase'),
  admin = require('firebase-admin');

module.exports.initAdminApp = function() {
  var serviceAccount = process.env.NODE_ENV === 'production' ? path.resolve('./firebase-service-account-key.json') : path.resolve('./firebase-service-account-key.json');
  var defaultApp = admin.initializeApp({
    'credential': admin.credential.cert(serviceAccount),
    'apiKey': config.firebase.apiKey,
    'authDomain': config.firebase.authDomain,
    'databaseURL': config.firebase.databaseURL,
    'storageBucket': config.firebase.storageBucket
  });

  _this.app = defaultApp;
};


module.exports.generateToken = function(userId, callback) {
  if (_this.app === undefined) {
    _this.initAdminApp();
  }
  admin.auth().createCustomToken(userId).then(function(customToken) {
    callback(customToken);
  }, function(err) {
    console.log(err);
  });
};

module.exports.signIn = function(token) {
  firebase.initializeApp({
    apiKey: config.firebase.apiKey,
    databaseURL: config.firebase.databaseURL
  });

  firebase.auth().signInWithCustomToken(token).then(function(user) {
    console.log('Firebase user:' + user);
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(error);
    // ...
  });
};

module.exports.createUser = function(user) {
  if (_this.app === undefined) {
    _this.initAdminApp();
  }
  admin.auth().createUser({
    'uid': user._id.toString(),
    'email': user.email,
    'displayName': user.displayName
  }).then(function(userRecord) {
    console.log('Successfully created new user:', userRecord.uid);
  }).catch(function(error) {
    console.log('Error creating new user:', error);
  });
};
