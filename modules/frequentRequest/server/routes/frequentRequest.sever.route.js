'use strict';

module.exports = function (app) {
  // User Routes
  var frequentRequest = require('../controllers/frequentRequest.server');

  // Setting up the frequentRequest api
  app.route('/api/addFrequentRequest').post(frequentRequest.addFrequentRequest);
  app.route('/api/getFrequentRequests/:ownerId').get(frequentRequest.getFrequentRequests);
  app.route('/api/getStaffRequestEntity/:requestId').get(frequentRequest.getStaffRequestEntityByRequestId);
  app.route('/api/getFrequentRequestsByOrgId/:orgId').get(frequentRequest.getFrequentRequestsByOrgId);
  app.route('/api/updateFrequentRequest/:frequentRequestId').put(function(req,res)
		  {frequentRequest.updateFrequentRequest
		  });
		  
  
  app.route('/api/frequentRequests/:frequentRequestId')
   .put(frequentRequest.update)
    .delete(frequentRequest.delete);

  // Finish by binding the user middleware
  // app.param('es_id', establishment.check_establishment);

// middleware
  app.param('frequentRequestId',frequentRequest.frequentRequestById);
};