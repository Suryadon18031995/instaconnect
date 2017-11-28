'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Organization = mongoose.model('Organization'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  fs = require('fs'),
  _this = this,
  _ = require('lodash');

/**
 * Create a Organization
 */

exports.createNew = function (req, res) {
  var organization = new Organization(req.body);
  organization.createdBy = req.user;

  // Organization.findOne({
  //   'organizationName': organization.organizationName
  // }, function (err, org) {
  //   if (err) {
  //     return res.status(400).send({
  //       message: errorHandler.getErrorMessage(err)
  //     });
  //   } else if (org != null) {
  //     return res.status(400).send({
  //       message: organization.organizationName + ' already exists'
  //     });
  //   } else {
      organization.save(function (err, newOrg) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          User.findOne({
            '_id': req.user._id
          }, function(err, usr) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              usr.organization = organization;
              usr.save(function(err) {
                if (err) {
                  return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  res.jsonp(organization);
                }
              });
            }
          });
        }
      });
    // }
  // });
};

exports.create = function (req, res) {
  var user = req.user;
  var organization = new Organization();
  organization.createdBy = user;

  var existingImageUrl;

  // Filtering to upload only images
  var multerConfig = config.uploads.organization.image;
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;
  var upload = multer(multerConfig).single('newOrgLogo');

  if (user) {
    uploadImage()
      .then(createOrganization)
      .then(updateUser)
      // .then(deleteOldImage)
      .then(function () {
        res.json(organization);
      })
      .catch(function (err) {
        deleteImage().then(function () {
          res.status(422).send(err);
        });
      });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage() {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          organization.organizationName = req.body.organizationName;
          resolve();
        }
      });
    });
  }

  function createOrganization() {
    return new Promise(function (resolve, reject) {
      Organization.findOne({
        'organizationName': organization.organizationName
      }, function (err, org) {
        if (err) {
          reject(err);
        } else if (org != null) {
          reject({
            'message': organization.organizationName + ' already exists'
          });
        } else {
          organization.logo = config.uploads.organization.image.dest + req.file.filename;
          organization.save(function (err, newOrg) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  function updateUser() {
    return new Promise(function (resolve, reject) {
      User.findOne({
        '_id': user._id
      }, function (err, user) {
        if (err) {
          reject(err);
        } else {
          user.organization = organization;
          user.orgRole = 'admin';

          user.save(function (err, theuser) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  function deleteOldImage() {
    return new Promise(function (resolve, reject) {
      if (existingImageUrl !== Organization.schema.path('profileImageURL').defaultValue) {
        fs.unlink(existingImageUrl, function (unlinkError) {
          if (unlinkError) {
            console.log(unlinkError);
            reject({
              message: 'Error occurred while deleting old profile picture'
            });
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  function deleteImage() {
    return new Promise(function (resolve, reject) {
      var uploadedImageUrl = config.uploads.organization.image.dest + req.file.filename;
      fs.unlink(uploadedImageUrl, function (unlinkError) {
        if (unlinkError) {
          reject({
            message: 'Error occurred while deleting old uploaded picture'
          });
        } else {
          resolve();
        }
      });
    });
  }
};

/**
 * Show the current Organization
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var organization = req.organization ? req.organization.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  organization.isCurrentUserOwner = req.user && organization.user && organization.user._id.toString() === req.user._id.toString();

  res.jsonp(organization);
};

/**
 * Update a Organization
 */
exports.update = function (req, res) {
  var organization = req.organization;

  organization = _.extend(organization, req.body);

  organization.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(organization);
    }
  });
};

/**
 * Delete an Organization
 */
exports.delete = function (req, res) {
  var organization = req.organization;

  organization.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(organization);
    }
  });
};

/**
 * List of Organizations
 */
exports.list = function (req, res) {
  Organization.find().sort('-created').populate('user', 'displayName').exec(function (err, organizations) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(organizations);
    }
  });
};

/**
 * Get Members of Organization
 */

exports.getMembers = function (req, res) {
  User.find({
    'organization': req.organization
  }).exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var members = [];
      _.each(users, function (user) {
        members.push({
          'id': user._id,
          'name': user.firstName + ' ' + user.lastName,
          'isOwner': req.organization.createdBy.toString() === user._id.toString(),
          'isAdmin': user.roles.indexOf('admin') !== -1,
          'status': user.status
        });
      });

      res.json(members);
    }
  });
};

/**
 * Organization middleware
 */
exports.organizationByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Organization is invalid'
    });
  }

  Organization.findById(id).populate('user', 'displayName').exec(function (err, organization) {
    if (err) {
      return next(err);
    } else if (!organization) {
      return res.status(404).send({
        message: 'No Organization with that identifier has been found'
      });
    }
    req.organization = organization;
    next();
  });
};

/**
 * Update organization picture
 */
exports.changeOrganizationPicture = function (req, res) {
  var user = req.user;
  var existingImageUrl;

  // Filtering to upload only images
  var multerConfig = config.uploads.profile.image;
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;
  var upload = multer(multerConfig).single('newLogoPicture');

  if (user) {
    existingImageUrl = user.profileImageURL;
    uploadImage()
      .then(updateUser)
      .then(deleteOldImage)
      .then(login)
      .then(function () {
        res.json(user);
      })
      .catch(function (err) {
        res.status(422).send(err);
      });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage() {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function updateUser() {
    return new Promise(function (resolve, reject) {
      user.profileImageURL = config.uploads.profile.image.dest + req.file.filename;
      user.save(function (err, theuser) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  function deleteOldImage() {
    // return new Promise(function (resolve, reject) {
    //   if (existingImageUrl !== User.schema.path('profileImageURL').defaultValue) {
    //     fs.unlink(existingImageUrl, function (unlinkError) {
    //       if (unlinkError) {
    //         console.log(unlinkError);
    //         reject({
    //           message: 'Error occurred while deleting old profile picture'
    //         });
    //       } else {
    //         resolve();
    //       }
    //     });
    //   } else {
    //     resolve();
    //   }
    // });
  }

  function login() {
    return new Promise(function (resolve, reject) {
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          resolve();
        }
      });
    });
  }
};

exports.deactivateUser = function(req, res) {
  var userId = req.body.userId;
  var redirectedUserId = req.body.redirectedUserId;

  User.findOne({
    '_id': userId
  }).exec(function (err, user) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      user.status = 'Inactive';
      user.redirectUser = redirectedUserId;

      user.save(function(err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          return res.status(200).send({
            message: 'The account has been deactivated.'
          });
        }
      });
    }
  });
};
