var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var staffRequestEntitySchema = new Schema({
	staffId:{
			type:[{ type: Schema.Types.ObjectId, ref: 'User' }],
			unique: true
		  },
    requestId:{
    	    type:[{ type: Schema.Types.ObjectId, ref: 'FrequentRequest' }],
    	    unique: true
          },
    createdBy: {
  	    type: Date,
  	    unique:true
  	      },
    createdOn: {
  		type: Date,
  		default: Date.now
  	      }
});

mongoose.model('StaffRequestEntity', staffRequestEntitySchema);