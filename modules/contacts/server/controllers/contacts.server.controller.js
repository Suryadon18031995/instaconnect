'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  _this = this,
  mongoose = require('mongoose'),
  moment = require('moment'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  Prospects = mongoose.model('Prospects'),
  async = require('async'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Send a Notification
 */
exports.getContacts = function (req, res, next) {
  Prospects.find({
    'userId': req.user._id
  }).sort('-created').populate('locationInfo').exec(function(err, prospects) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(prospects);
    }
  });
};
