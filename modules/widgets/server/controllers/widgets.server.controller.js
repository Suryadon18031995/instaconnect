'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  shortid = require('shortid'),
  Chance = require('chance'),
  chance = new Chance(),
  QRCode = require('qrcode'),
  Async = require('async'),
  Widget = mongoose.model('Widget'),
  Organization = mongoose.model('Organization'),
  Preview = mongoose.model('Preview'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

var opts = {
  errorCorrectionLevel: 'H',
  type: 'image/png',
}
// generate unique code for widget

exports.unique_code = function(req,res){ 
    var code = chance.phone().replace('(', '').replace(') ', '-');
    var uniqueCode = code.substring(0,code.length - 1);
    res.send({unique_code: uniqueCode})
}
/**
 * Create a Widget
 */
exports.create = function(req, res) {
  var widget = new Widget(req.body);
  widget.uniqueCode = shortid.generate();
  var qrCodeLink = req.headers.host+'/?wCode='+widget.conversationCode;
  QRCode.toDataURL(qrCodeLink, opts, function (err, url) {
    if (err) throw err
    widget.imageUrl = url;
    widget.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(widget);
      }
    });
  })
};

/**
 * Create Multiple  Widget
 */
exports.createMultiple = function(req, res) {
  var startRange = req.body.startRange;
  var endRange = req.body.endRange;
  var widgetPrefix = req.body.widget_prefix;
  var widgetArray = [];

  for (var index = startRange; index <= endRange; index++) {
    var widget = new Widget(req.body);
    widget.uniqueCode = shortid.generate();
    var code = chance.phone().replace('(', '').replace(') ', '-');
    widget.conversationCode = code.substring(0,code.length - 1);
    widget.widgetName = widgetPrefix+" "+index;
    widgetArray.push(widget);
  }

  Async.each(widgetArray,function(widget, done) {
      var qrCodeLink = req.headers.host+'/?wCode='+widget.conversationCode;
      QRCode.toDataURL(qrCodeLink, opts, function (err, url) {
        if (err) throw err
        widget.imageUrl = url;
        done();
    });
  }, function(error, widgetsArray){      
      Widget.insertMany(widgetArray, function (err, widget){ 
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(widget);
        }
    });
  });
}

/**
 * Show the current Widget
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var widget = req.widget ? req.widget.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  widget.isCurrentUserOwner = req.user && widget.user && widget.user._id.toString() === req.user._id.toString();

  res.jsonp(widget);
};

/**
 * Update a Widget
 */
exports.update = function(req, res) {
  var widget = req.widget;

  widget = _.extend(widget, req.body);

  widget.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(widget);
    }
  });
};

/**
 * Delete an Widget
 */
exports.delete = function(req, res) {
  var widget = req.widget;
  widget.isDeleted = true;

  widget.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(widget);
    }
  });
};

/**
 * List of Widgets
 */
exports.list = function(req, res) {
  Widget.find().sort('-created').populate('user', 'displayName').exec(function(err, widgets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(widgets);
    }
  });
};

/**
 * List of Widgets based on organization id
 */
exports.widgetsByOrgId = function(req, res) {
  var organization = req.organization;
    Widget.find({
      'user': organization.createdBy,
      $or: [{ 'isDeleted': false }, { 'isDeleted': undefined }]
    }).populate('assignedTo','_id displayName').sort('-created').exec(function(err, widgets) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        return res.send({data: widgets});
      }
    });
};

/**
 * Widget middleware
 */
exports.widgetByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Widget is invalid'
    });
  }

  Widget.findById(id).populate('user', 'displayName').exec(function (err, widget) {
    if (err) {
      return next(err);
    } else if (!widget) {
      return res.status(404).send({
        message: 'No Widget with that identifier has been found'
      });
    }
    req.widget = widget;
    next();
  });
};


/**
 * Organization middleware
 */
exports.organizationByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Widget is invalid'
    });
  }

  Organization.findById(id).exec(function (err, organization){
    if (err) {
      return res.status(404).send({
        message: errorHandler.getErrorMessage(err)
      });
    }else {
      req.organization = organization;
      next()
    }
  });
};



exports.widgetByUser = function(req, res) {
  Widget.findOne({
    'user': req.profile,
    $or: [{ 'isDeleted': false }, { 'isDeleted': undefined }]
  }).exec(function(err, widget) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(widget);
    }
  });
};

exports.widgetsByUser = function(req, res) {
  Widget.find({
    'user': req.profile,
    $or: [{ 'isDeleted': false }, { 'isDeleted': undefined }]
  }).populate('assignedTo','_id displayName').sort('-widgetName').exec(function(err, widgets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(widgets);
    }
  });
};

exports.getWidgetImage = function(req, res) {
  res.redirect(req.widget.imageUrl);
};

exports.widgetByUniqueCode = function(req, res) {
  var uniqueCode = req.params.uniqueCode;

  Widget.findOne({
    'uniqueCode': uniqueCode,
    'isDeleted': false
  }).exec(function(err, widget) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(widget);
    }
  });
};

exports.widgetByConversationCode = function(req, res) {
  var conversationCode = req.params.conversationCode;
  Widget.findOne({
    'conversationCode': conversationCode,
    'isDeleted': false
  }).populate('user').populate('assignedTo','_id displayName').exec(function(err, widget) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(widget);
    }
  });
};

exports.widgetByWidgetId = function(req, res) {
  var widget = req.widget;
  if (widget.imageUrl.startsWith('/modules')) {
    widget.imageUrl = 'https://growth-web.herokuapp.com' + widget.imageUrl;
  }

  res.jsonp(widget);
};

exports.savePreview = function (req,res) {
  var previewObject = new Preview(req.body)
  previewObject.save(function(err,saved){
    if(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }else{
      res.send({data:saved})
    }
  })
};


exports.getPreviewById = function (req,res){
Preview.find({userId:req.body._id},function(err,result){
    if(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }else{
      res.send({data:result})
    }
})
};

exports.updatePreview = function(req, res){
  var pre = req.preview
     pre = _.extend(pre, req.body)

     pre.save(function(err, updated){
        if(err){
            return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }else{
          res.send({data:updated})
        }
     })
};


//Middlewares
exports.checkPreview =function (req, res, next, id)
{
   if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'preview is invalid'
    });
  }

  Preview.findById(id).exec(function (err, pre) {
    if (err) {
      return next(err);
    } else if (!pre) {
      return res.status(404).send({
        message: 'No Preview with that identifier has been found'
      });
    }
    // console.log("This is the es at middleware",es)
    req.preview = pre;
    next();
  });
}
