'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  _this = this,
  mongoose = require('mongoose'),
  moment = require('moment'),
  config = require(path.resolve('./config/config')),
  EmailNotification = mongoose.model('EmailNotification'),
  User = mongoose.model('User'),
  Prospects = mongoose.model('Prospects'),
  async = require('async'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  postmark = require('postmark');

/**
 * Send a Notification
 */
exports.sendOfflineMessage = function (req, res, next) {
  var message = req.body.message,
    prospectsId = req.body.prospectsId,
    userId = req.body.userId,
    current = moment(Date.now()),
    lastMessageTime = moment(Date.now()).subtract(config.lastEmailDurationInHours, 'h');

  async.waterfall([
    function (done) {
      EmailNotification.count({
        'prospectsId': prospectsId,
        'userId': userId,
        'created': { $lt: current, $gt: lastMessageTime }
      }, function (err, count) {
        done(err, count);
      });
    },
    function (count, done) {
      if (count === 0) {
        User.findById(userId, function (err, user) {
          if (!user) {
            return res.status(400).send({
              message: 'User not found!'
            });
          } else {
            done(err, user);
          }
        });
      } else {
        return res.status(200).send({
          message: 'Last email was sent within last 2 hrs'
        });
      }
    },
    function (user, done) {
      Prospects.findById(prospectsId, function (err, prospects) {
        if (!prospects) {
          User.findById(userId, function (err, usr) {
            if (!user) {
              return res.status(400).send({
                message: 'Prospects not found'
              });
            } else {
              done(err, user, usr);
            }
          });
        } else {
          done(err, user, prospects);
        }
      });
    },

    function (user, prospects, done) {
      res.render(path.resolve('modules/chats/server/templates/email-notification'), {
        name: user.displayName,
        clientName: prospects.name !== undefined ? prospects.name : prospects.displayName,
        message: message
      }, function (err, emailHTML) {
        done(err, user, prospects, emailHTML);
      });
    },

    // If valid email, send reset email using service
    function (user, prospects, emailHTML, done) {
      var client = new postmark.Client(config.mailer.postmarkServerToken);
      var options = {
        'From': config.mailer.from,
        'To': user.email,
        'Subject': 'New Message from ' + prospects.name,
        'HtmlBody': emailHTML
      };
      client.sendEmail(options, function (err, success) {
        if (!err) {
          res.send({
            message: 'An email has been sent to the user with your message.'
          });
          done(err, user, prospects, message);
        } else {
          return res.status(400).send({
            message: 'Failure sending email'
          });
        }
      });
    },

    function (user, prospects, message, done) {
      var notification = new EmailNotification();
      notification.userId = user._id;
      notification.prospectsId = prospects._id;
      notification.message = message;

      notification.save(function(err) {
        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
  });
};
