'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  path = require('path'),
  _this = this,
  isRedirected = false,
  originalChatUser = undefined,
  Firebase = require(path.resolve('./config/lib/firebase.js'));

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    User.findOne({
      userName: id
    }).exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load User ' + id));
      }

      req.profile = user;
      next();
    });
  } else {
    User.findById(id, '-salt -password -providerData').exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load user ' + id));
      }

      req.profile = user;
      next();
    });
  }
};

exports.generateToken = function(req, res) {
  Firebase.generateToken(req.profile._id.toString(), function(customToken) {
    return res.json({
      'token': customToken
    });
  });
};

exports.findByUsernameOrId = function(req, res, next) {
  _this.isRedirected = false;
  var id = req.params.userNameOrId;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    User.findOne({
      displayName: id
    }).populate({ path: 'redirectUser', populate: { path: 'redirectUser' } }).exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load User ' + id));
      }

      _this.originalChatUser = user;
      _this.checkIsActiveUser(req, res, user);
    });
  } else {
    User.findById(id, '-salt -password -providerData').populate({ path: 'redirectUser', populate: { path: 'redirectUser' } }).exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load user ' + id));
      }

      _this.originalChatUser = user;
      _this.checkIsActiveUser(req, res, user);
    });
  }
};

exports.checkIsActiveUser = function(req, res, user) {
  if (user.status === 'Inactive' && user.redirectUser) {
    _this.isRedirected = true;
    _this.checkIsActiveUser(req, res, user.redirectUser);
  } else {
    res.json({
      'user': user,
      'isRedirected': _this.isRedirected,
      'originalChatUser': _this.originalChatUser
    });
  }
};
