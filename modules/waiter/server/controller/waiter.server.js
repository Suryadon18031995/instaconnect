'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  ObjectId = require('mongodb').ObjectID,
  shortid = require('shortid'),
  Widget = mongoose.model('Widget'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  postmark = require('postmark'),
  config = require(path.resolve('./config/config')),
  _ = require('lodash'),
  Async = require('async'),
  passport = require('passport'),
  User = mongoose.model('User'),
  userAuthenticationController = require(path.resolve('./modules/users/server/controllers/users/users.authentication.server.controller')),
  Passport = mongoose.model('Passport'),
  Organization = mongoose.model('Organization'),
  Chance = require('chance'),
  chance = new Chance(),
  _this = this,
  Firebase = require(path.resolve('./config/lib/firebase.js'));

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];




/**
 * Signup
 */
exports.addWaiter = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init user and add missing fields
  var user = new User(req.body);
  var nameArray = userAuthenticationController.generateFirstLastName(req.body.name);
  user.firstName = nameArray[0];
  user.lastName = nameArray[1];
  user.displayName = user.firstName + ' ' + user.lastName;
  user.email = req.body.email;
  user.orgRole = ['waiter'];

  // Then save the user
  user.save(function (err, theuser) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var pass = new Passport();
      pass.provider = 'local';
      pass.password = req.body.password;
      pass.userId = user;
      pass.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          // Firebase.createUser(user);
          Organization.findOne({createdBy: req.body.userId}, function (err, organization) {
            user.organization = organization;
            user.save(function (err) {
              if (err) {
                console.info(err);
              } else {
                sendInvitationMail(user, req, res)
              }
            });
          })

          return res.send(user);
        }
      });
    }
  });
};

/**
 * Create a Campaign
 */

exports.addWaiterTemp = function (req, res) {
  var waiterobj = new Waiter(req.body);
  Waiter.findOne({ Email: req.body.Email }, function (err, waiter) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    else {
      if (waiter) {
        return res.send({ status: false, message: 'Email Already Exist', data: [] });
      }
      else {
        waiterobj.save(function (err, waiter) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });

          }
          else {
            tmpWaiterController.signup(req, res, waiter);
          }
        });
      }

    }
  });
};

exports.getWaiters = function (req, res) {
  Organization.findOne({createdBy: ObjectId(req.params._id)}, function (err, organization) {
    if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
         User.find({organization: organization._id,orgRole: {$in:['waiter']}, isDeleted: false}, function(err1,waiters){
          if (err1) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            return res.jsonp(waiters);
          }
        }); 
      }
  });
};

exports.getWaiterById = function (req, res) {
  User.findOne({ _id: req.params.waiter_id, isDeleted: false }, function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    else {
        return res.jsonp(result);
    }
  })

}

exports.updateWaiter = function (req, res) {
  var waiterObj = req.waiter;

  waiterObj = _.extend(waiterObj, req.body)

  var nameArray = userAuthenticationController.generateFirstLastName(req.body.name);
  waiterObj.firstName = nameArray[0];
  waiterObj.lastName = nameArray[1];
  waiterObj.displayName = waiterObj.firstName + ' ' + waiterObj.lastName;

  waiterObj.save(function (err, saved) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    else {
      res.send({ data: saved });
    }
  })

};

exports.deleteWaiter = function (req, res) {
  var user = req.waiter;
  user.isDeleted = true;
  user.save(function (err, deleted) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }else {
       if(user.widgetsAssigned.length) {
          Async.each(user.widgetsAssigned, function(widgetId,callback) {
              Widget.update({_id:ObjectId(widgetId)},{$set:{assignedTo: null}}, function(err, success){
                if(err) {
                  return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                }
                callback(err);
              })
          }, function(err) {
                if(err) {
                  return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                }else {
                  User.find({organization: req.params.organization,orgRole: {$in:['waiter']}, isDeleted: false}, function(err1,waiters){
                    if (err1) {
                      return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                      });
                    } else {
                      return res.jsonp(waiters);
                    }
                });
                }
            })
      } else {
          User.find({organization: req.params.organization,orgRole: {$in:['waiter']}, isDeleted: false}, function(err1,waiters){
              if (err1) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                return res.jsonp(waiters);
              }
          });
      }

    }
  });
};

exports.updateWaiterWidgets = function (req, res) {

  var waiter = req.waiter;
  User.update({ _id: ObjectId(waiter._id) }, { $addToSet: { widgetsAssigned: req.body.widgetId } }, function (err, saved) {
    if (err) {
      res.status(400).send({ status: false, message: 'fail to updateWaiterWidgets' });
    }
    else {

      Widget.update({ _id: ObjectId(req.body.widgetId) }, { $set: { assignedTo: waiter._id } }, function (err, result) {
        if (err) {
          res.status(400).send({ status: false, message: 'fail to updateWaiterWidgets' });
        }
        else {
          res.send({ status: true, data: result });
        }
      });

    }

  });


};

exports.deleteWaiterWidgets = function (req, res) {

  var waiter = req.waiter;
  User.update({ _id: ObjectId(waiter._id) }, { $pull: { widgetsAssigned: req.body.widgetId } }, function (err, saved) {
    if (err) {
      res.send({ status: false, message: 'fail' });
    }
    else {
      Widget.update({ _id: ObjectId(req.body.widgetId) }, { $set: { assignedTo: null}}, function (err, result) {
        if (err) {
          res.send({ status: false, message: "fail to update waiter" });
        }
        else {
          res.send({ status: true, data: saved });
        }
      });

    }

  });



};

exports.findWidgetsById = function (req, res) {
  Widget.find({ user: ObjectId(req.params.user_id), isDeleted: false }, function (err, widgets) {
    if (err) {
      res.send({ status: false, message: "fail to find widgets" });
    }
    else {
      res.send({ status: true, message: 'Success', data: widgets });
    }
  });

};
exports.findUnAssingedWidgets = function (req, res) {
  Widget.find({ user: ObjectId(req.params.user_id) }, function (err, widgets) {
    if (err) {
      return res.send({ status: false, message: "fail to find widgets" });
    }
    else {
      return res.send(widgets);
    }
  })
};


//Middlewares
exports.checkWaiter = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Waiter is invalid'
    });
  }

  User.findOne({ _id: ObjectId(id) }).exec(function (err, waiter) {
    if (err) {
      return next(err);
    } else if (!waiter) {
      return res.status(404).send({
        message: 'No waiter with that identifier has been found'
      });
    }
    req.waiter = waiter;
    next();
  });
};

function sendInvitationMail(user, req, res) {

  var httpTransport = 'http://';
  if (config.secure && config.secure.ssl === true) {
    httpTransport = 'https://';
  }
  var baseUrl = req.app.get('domain') || httpTransport + req.headers.host;
  var url = baseUrl + '?userId=' + user._id;

  res.render(path.resolve('modules/invitations/server/templates/send-invite'), {
    invitedBy: req.user.firstName + ' ' + req.user.lastName,
    name: user.displayName,
    appName: config.app.title,
    url: url,
    estblishmentName: user.organization.organizationName,
    establishmentLocation: user.organization.address
  }, function (err, emailHTML) {
    var client = new postmark.Client(config.mailer.postmarkServerToken);
    var options = {
      'From': config.mailer.from,
      'To': user.email,
      'Subject': 'Invitation to Join ' + config.app.title,
      'HtmlBody': emailHTML
    };
    client.sendEmail(options, function (err, success) {
      if (!err) {
        console.info('Invitation Sent Successfully!');
      } else {
        console.info('Error sending mail');
        console.info(err);
      }
    });
  });
};

