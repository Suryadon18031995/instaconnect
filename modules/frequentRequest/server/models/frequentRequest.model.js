'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

/**
 * Widget Schema
 */
var frequentRequestSchema = new Schema({
	ownerId: {
		type: Schema.ObjectId,
		ref:'User'
	},
	title: {
		type: String,
		trim:true
	},
	message: {
		type: String,
		trim: true
	},
	imageUrl: {
		type: String,
		trim: true
	},
	positionId:{
		type:Number,
	default:0
	},
	isSelected: {
		type: Boolean,
	default: false
	},
	isDefault: {
		type: Boolean,
	default: false
	},
	createdOn: {
		type: Date,
	default: Date.now
	},
	routingType:{
		type: String,
	default: 'defaultroute'
	},

});

mongoose.model('FrequentRequest', frequentRequestSchema);
