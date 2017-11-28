'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    shortid = require('shortid'),
    async = require('async'),
    FrequentRequest = mongoose.model('FrequentRequest'),
    StaffRequestEntity = mongoose.model('StaffRequestEntity'),
    Organization = mongoose.model('Organization'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

exports.addFrequentRequest = function(req, res) {
    var reqObj = new FrequentRequest(req.body);
    var assignRequest = req.body;
    reqObj.save(function(err, result) {
        if (err) {
            res.send({
                status: false,
                message: 'fail to add request'
            });
        } else {
        	assignRequest._id = result._id;
        	insertStaffMode();
            res.send({
                status: true,
                message: 'Request added successfully',
                data: result
            });
        }
    })
    
    function insertStaffMode()
    {
    	if(assignRequest.routingType === 'staffroute')
        {
        	var StaffList = [];
        	console.log(assignRequest);
        	console.log('saving staff list......');
        	for (var i = 0; i < assignRequest.staffList.length; i++)
    		{
    			var staffRequestEntity  = new StaffRequestEntity();
    			staffRequestEntity.staffId=assignRequest.staffList[i];
    			staffRequestEntity.requestId=assignRequest._id;
    			StaffList.push(staffRequestEntity);
    			console.log("Data to be saved.....");
            	console.log(StaffList);
    			staffRequestEntity.save(StaffList[i])
            	.then(
            			function(result)
            			{
            				console.log('Records saved succesfully.....');
            				console.log(result);
            			}
            	)
            	.catch(
            			function(err)
            			{
            				console.error('Error saving request staff entities');
            			}
            	);
    		}
        	
        	//var staffRequestEntity  = new StaffRequestEntity();
        	
        }
    }
};

exports.getStaffRequestEntityByRequestId = function(req, res){
	StaffRequestEntity.find({
		requestId:req.params.requestId
		}, function(err, staffRequestEntity){
			if(err) {
				res.send(err);
			} else {
				res.send(staffRequestEntity);
			}
		});
};

exports.getFrequentRequests = function(req, res) {
    FrequentRequest.find({
        ownerId: req.params.ownerId
    }, function(err, frequentRequestList) {
        if (err) {
            res.send(err);
        } else {
        	res.send(frequentRequestList);
        }
    });
};

exports.getFrequentRequestsByOrgId = function(req, res) {
    Organization.findById(req.params.orgId).exec(function(err, organization) {
        if (err) {
            res.send(err);
        } else {
            FrequentRequest.find({
                ownerId: organization.createdBy
            }, function(err, frequentRequestList) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(frequentRequestList);
                }
            });
        }
    });
};


exports.update = function(req,res) {
    var frequentRequest = req.frequentRequest;
    console.log(req.body);
    frequentRequest = _.extend(frequentRequest,req.body);

    frequentRequest.save(function(err){
        if(err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else {
        	updateStaffMode();
            return res.jsonp(frequentRequest);
        }
    });
    
    function updateStaffMode()
    {
    	if(frequentRequest.routingType === 'staffroute')
        {
    		StaffRequestEntity.update({requestId:frequentRequest._id},{staffId:frequentRequest.staffList[0]})
    		.then(
        			function(result)
        			{
        				console.log('Records updated succesfully.....');
        				console.log(result);
        			}
        	)
        	.catch(
        			function(err)
        			{
        				console.error('Error updating request staff entities');
        			}
        	);
        }
    }
}

exports.delete = function(req,res){
    var frequentRequest = req.frequentRequest;
    frequentRequest.remove(function(err){
        if(err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else {
        	deleteStaffRequestEntities();
            return res.jsonp(frequentRequest);
        }
    });
    
    function deleteStaffRequestEntities()
    {
    	if(frequentRequest.routingType === 'staffroute')
    	{
    		StaffRequestEntity.remove({requestId:frequentRequest._id},
    				function(err){
    	        if(err){
    	            return res.status(400).send({
    	                message: errorHandler.getErrorMessage(err)
    	            });
    	        }else {
    	            return res.jsonp(frequentRequest);
    	        }
    	    })
    	}
    }
}

exports.frequentRequestById = function(req,res, next, id){
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({message: 'Frequent Request is invalid'})
    }

    FrequentRequest.findById(id).populate('ownerId','title').exec(function (err,frequentRequest){
        if (err){
            return next(err);
        }else if (!frequentRequest){
            return res.status(404).send({
                message: 'No frequent request with that identifier has been found'
            });
        }
        req.frequentRequest = frequentRequest;
        next();
    });
};