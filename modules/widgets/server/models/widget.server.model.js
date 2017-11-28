'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Widget Schema
 */
var WidgetSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  color: {
    type: String,
    trim: true
  },
  widgetText: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  updated: {
    type: Date,
    default: Date.now
  },
  widgetName: {
    type: String,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  uniqueCode: {
    type: String,
    trim: true
  },
  conversationCode: {
    type: String,
    trim: true
  },
  assignedTo : {
    type: Schema.ObjectId,
    ref: 'User',
    default: null
  }
});


var PreviewSchema = new Schema({
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  text: {
    type : String,
    trim : true
  }
});


mongoose.model('Widget', WidgetSchema);
mongoose.model('Preview',PreviewSchema)