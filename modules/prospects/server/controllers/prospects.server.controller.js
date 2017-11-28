'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Prospects = mongoose.model('Prospects'),
  User = mongoose.model('User'),
  LocationInfo = mongoose.model('LocationInfo'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Prospect
 */
exports.create = function (req, res) {
  var prospects = new Prospects(req.body);

  prospects.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(prospects);
    }
  });

  // Prospects.findOne({
  //   'email': req.body.email
  // }).exec(function (err, prospectsObj) {
  //   if (err) {
  //     return res.status(422).send({
  //       message: errorHandler.getErrorMessage(err)
  //     });
  //   } else {
  //     if (prospectsObj) {
  //       return res.json(prospectsObj);
  //     } else {
  //       prospects.save(function () {
  //         if (err) {
  //           return res.status(422).send({
  //             message: errorHandler.getErrorMessage(err)
  //           });
  //         } else {
  //           res.json(prospects);
  //         }
  //       });
  //     }
  //   }
  // });
};

/**
 * Show the current Prospect
 */
exports.read = function (req, res) {
  if (req.prospects) {
    if (req.prospects.loggedInUserId) {
      LocationInfo.findOne({
        'userId': req.prospects.loggedInUserId
      }).exec(function(err, locationInfo) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else if (locationInfo) {
          req.prospects.ipAddress = locationInfo.ipAddress;
          req.prospects.address = locationInfo.address;
          req.prospects.channel = locationInfo.channel;
          req.prospects.location = locationInfo.location;

          res.json(req.prospects);
        } else {
          res.json(req.prospects);
        }
      });
    } else {
      res.json(req.prospects);
    }
  } else {
    var prospectsId = req.params.prospectsId;
    User.findOne({
      '_id': prospectsId
    }).exec(function(err, user) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else if (!user) {
        return res.status(404).send({
          message: 'No Prospects with that identifier has been found'
        });
      } else {
        var response = {
          'name': user.displayName,
          'email': user.email,
          'ipAddress': '',
          'address': '',
          'channel': '',
          'location': ''
        };
        LocationInfo.findOne({
          'userId': user._id
        }).exec(function(err, locationInfo) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else if (locationInfo) {
            response.ipAddress = locationInfo.ipAddress;
            response.address = locationInfo.address;
            response.channel = locationInfo.channel;
            response.location = locationInfo.location;

            res.json(response);
          } else {
            res.json(response);
          }
        });
      }
    });
  }
};

/**
 * Update a Prospect
 */
exports.update = function (req, res) {
  var prospects = req.body;
  prospects.ipAddress = req.connection.remoteAddress;
  prospects.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      LocationInfo.findOne({
        'userId': req.body.loggedInUserId
      }).exec(function(err, locationInfo) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else if (locationInfo) {
          locationInfo.ipAddress = req.connection.remoteAddress;
          locationInfo.address = req.body.address;
          locationInfo.location = req.body.location;
          locationInfo.channel = req.body.channel;

          var loggedInUserId = req.body.loggedInUserId;
          if (loggedInUserId) {
            locationInfo.userId = loggedInUserId;
          }

          locationInfo.save(function(err) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(prospects);
            }
          });
        } else {
          var newLocationInfo = new LocationInfo(req.body);
          newLocationInfo.address = req.body.address;
          newLocationInfo.location = req.body.location;
          newLocationInfo.channel = req.body.channel;
          newLocationInfo.ipAddress = req.connection.remoteAddress;
          newLocationInfo.created = Date.now();
          newLocationInfo.userId = prospects._id;
          newLocationInfo.save(function(err) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(prospects);
            }
          });
        }
      });
    }
  });
};

/**
 * Delete an Prospect
 */
exports.delete = function (req, res) {

};

/**
 * List of Prospects
 */
exports.listNew = function (req, res) {
  var perPage = 10;
  var page = req.query.page === undefined ? 1 : parseInt(req.query.page, 10);
  var userId = req.query.userId;
  var skipPage = page === 1 ? 0 : perPage * page;

  Prospects.find({
    'userId': userId
  }, '-__v').limit(perPage).skip(skipPage).sort({ name: 'asc' }).exec(function (err, prospects) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      Prospects.count().exec(function (err, count) {
        res.json({
          'prospects': prospects,
          'page': page,
          'total_pages': Math.floor(count / perPage)
        });
      });
    }
  });
};

/**
 * List of Prospects
 */
exports.list = function (req, res) {
  Prospects.find({}, '-__v').exec(function(err, prospects) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(prospects);
    }
  });
};

exports.saveLocationInfo = function(req, res) {
  var userId = req.body.userId;

  LocationInfo.findOne({
    'userId': userId
  }).exec(function(err, locationInfo) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (locationInfo) {
      locationInfo.ipAddress = req.connection.remoteAddress;
      locationInfo.address = req.body.address;
      locationInfo.location = req.body.location;
      locationInfo.channel = req.body.channel;

      locationInfo.save(function(err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(locationInfo);
        }
      });
    } else {
      var newLocationInfo = new LocationInfo(req.body);
      newLocationInfo.ipAddress = req.connection.remoteAddress;
      newLocationInfo.created = Date.now();
      newLocationInfo.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          Prospects.findById(userId).exec(function(err, prospects) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else if (prospects) {
              prospects.locationInfo = newLocationInfo;
              prospects.save(function(err) {
                if (err) {
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  res.json(newLocationInfo);
                }
              });
            } else {
              res.json(newLocationInfo);
            }
          });
        }
      });
    }
  });
};

/**
 * Prospects middleware
 */
exports.prospectsByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Prospects is invalid'
    });
  }

  Prospects.findById(id).exec(function (err, prospects) {
    if (err) {
      return next(err);
    }
    // else if (!prospects) {
    //   return res.status(404).send({
    //     message: 'No Prospects with that identifier has been found'
    //   });
    // }
    req.prospects = prospects;
    next();
  });
};
