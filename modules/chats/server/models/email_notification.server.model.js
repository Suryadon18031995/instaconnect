'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * EmailNotification Schema
 */
var EmailNotificationSchema = new Schema({
  prospectsId: {
    type: String,
    trim: ''
  },
  userId: {
    type: String,
    trim: ''
  },

  message: {
    type: String,
    trim: ''
  },

  created: {
    type: Date,
    default: Date.now
  }

});

mongoose.model('EmailNotification', EmailNotificationSchema);
