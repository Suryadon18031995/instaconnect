'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Prospects Schema
 */
var ProspectsSchema = new Schema({
  email: {
    type: String,
    index: {
      unique: false,
      sparse: true // For this to work on a previously indexed field, the index must be dropped & the application restarted.
    },
    lowercase: true,
    trim: true,
    default: ''
  },

  name: {
    type: String,
    trim: true
  },

  title: {
    type: String,
    trim: true
  },

  company: {
    type: String,
    trim: true
  },

  contactNumber: {
    type: String,
    trim: true
  },

  created: {
    type: Date,
    default: Date.now
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

  locationInfo: {
    type: Schema.ObjectId,
    ref: 'LocationInfo'
  },

  loggedInUserId: {
    type: Schema.ObjectId,
    ref: 'User'
  }

});

mongoose.model('Prospects', ProspectsSchema);
