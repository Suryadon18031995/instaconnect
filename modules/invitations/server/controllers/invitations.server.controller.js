'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Invitation = mongoose.model('Invitation'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  async = require('async'),
  config = require(path.resolve('./config/config')),
  postmark = require('postmark'),
  _this = this,
  _ = require('lodash');

/**
 * Create a Invitation
 */
exports.create = function (req, res) {
  var loggedInUser = req.user;
  Invitation.find({
    'invitedBy': loggedInUser,
    'email': req.body.email,
    'number': req.body.number,
    'organization': loggedInUser.organization,
    'status': {
      $ne: 'Rejected'
    }
  }).exec(function (err, existingInvitations) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (existingInvitations && existingInvitations.length > 0) {
      res.json({
        'message': 'You have already sent invitation to ' + req.body.email
      });
    } else {
      User.findOne({
        'email': req.body.email
      }).exec(function(err, existingUser) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else if (existingUser) {
          res.json({
            'message': 'User with email ' + req.body.email + ' is already registered with app.'
          });
        } else {
          var invitation = new Invitation(req.body);
          invitation.organization = loggedInUser.organization;
          invitation.invitedBy = loggedInUser;

          invitation.save(function (err) {
            if (err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              _this.sendInvitationMail(invitation, req, res);
              res.json(invitation);
            }
          });
        }
      });
    }
  });
};

/**
 * Show the current Invitation
 */
exports.read = function (req, res) {
  var invitation = req.invitation;
  User.findOne({
    'email': invitation.email
  }).exec(function (err, user) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (user) {
      if (user.organization === undefined) {
        user.organization = invitation.organization;
        invitation.status = 'Accepted';

        user.save(function (err, usr) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            invitation.save(function (err, invite) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                // Redirect to show message, invitation is accepted successfully!
              }
            });
          }
        });
      } else if (user.organization === invitation.organization) {
        // Redirect to show message, you have already accepted the invitation for this organization!
      } else {
        // Redirect to show message, you have already joined another organization
      }
    } else {
      // Redirect to show message, account does not exists and redirect the user to signup page
    }
  });
};

/**
 * Update a Invitation
 */
exports.update = function (req, res) {

};

/**
 * Delete an Invitation
 */
exports.delete = function (req, res) {

};

/**
 * List of Invitations
 */
exports.list = function (req, res) {
  var loggedInUser = req.user;

  Invitation.find({
    'invitedBy': loggedInUser,
    'organization': loggedInUser.organization,
    'status': 'Pending'
  }).exec(function (err, invitations) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(invitations);
    }
  });
};

/**
 * Invitations middleware
 */
exports.invitationByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Invitation is invalid'
    });
  }

  Invitation.findById(id).exec(function (err, invitation) {
    if (err) {
      return next(err);
    } else if (!invitation) {
      return res.status(404).send({
        message: 'No Invitation with that identifier has been found'
      });
    }
    req.invitation = invitation;
    next();
  });
};


exports.sendInvitationMail = function (invitation, req, res) {
  var httpTransport = 'http://';
  if (config.secure && config.secure.ssl === true) {
    httpTransport = 'https://';
  }
  var baseUrl = req.app.get('domain') || httpTransport + req.headers.host;

  var url = baseUrl + '?userId='+invitation._id;

  res.render(path.resolve('modules/invitations/server/templates/send-invite'), {
    invitedBy: invitation.invitedBy.firstName + ' ' + invitation.invitedBy.lastName,
    name: invitation.name,
    appName: config.app.title,
    url: url
  }, function (err, emailHTML) {
    var client = new postmark.Client(config.mailer.postmarkServerToken);
    var options = {
      'From': config.mailer.from,
      'To': invitation.email,
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
