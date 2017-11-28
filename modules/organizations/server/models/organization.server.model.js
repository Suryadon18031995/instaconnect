'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Organization Schema
 */
var OrganizationSchema = new Schema({
  organizationName: {
    type: String,
    default: '',
    required: 'Please fill Organization name',
    trim: true
  },
  address: {
    type: String,
    default: '',
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  logo: {
    type: String,
    default: ''
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Organization', OrganizationSchema);
