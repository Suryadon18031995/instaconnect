'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Prospects Schema
 */
var LocationInfoSchema = new Schema({
  created: {
    type: Date
  },

  userId: {
    type: String,
    trim: true
  },

  ipAddress: {
    type: String,
    trim: true
  },

  address: {
    type: String,
    trim: true
  },

  location: {
    type: String,
    trim: true
  },

  channel: {
    type: String,
    trim: true
  },

  updated: {
    type: Date,
    default: Date.now
  }

});

mongoose.model('LocationInfo', LocationInfoSchema);
