'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  shortid = require('shortid'),
  Campaign = mongoose.model('Campaign'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Campaign
 */
exports.create = function (req, res) {
  var campaign = new Campaign(req.body);
  campaign.user = req.user;
  campaign.uniqueCode = shortid.generate();
  campaign.numberOfLeads = 0;

  campaign.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaign);
    }
  });
};

/**
 * Show the current Campaign
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var campaign = req.campaign ? req.campaign.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  campaign.isCurrentUserOwner = req.user && campaign.user && campaign.user._id.toString() === req.user._id.toString();

  res.jsonp(campaign);
};

/**
 * Update a Campaign
 */
exports.update = function (req, res) {
  var campaign = req.campaign;

  campaign = _.extend(campaign, req.body);

  campaign.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaign);
    }
  });
};

/**
 * Delete an Campaign
 */
exports.delete = function (req, res) {
  var campaign = req.campaign;

  campaign.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaign);
    }
  });
};

/**
 * List of Campaigns
 */
exports.list = function (req, res) {
  Campaign.find({
    'user': req.user
  }).populate('widget').sort('-created').exec(function (err, campaigns) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaigns);
    }
  });
};

/**
 * Campaign middleware
 */
exports.campaignByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Campaign is invalid'
    });
  }

  Campaign.findById(id).populate('user', 'displayName').exec(function (err, campaign) {
    if (err) {
      return next(err);
    } else if (!campaign) {
      return res.status(404).send({
        message: 'No Campaign with that identifier has been found'
      });
    }
    req.campaign = campaign;
    next();
  });
};

exports.campaignsByUser = function (req, res, next, id) {
  Campaign.find({
    'user': req.user
  }).exec(function (err, campaigns) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaigns);
    }
  });
  
};
