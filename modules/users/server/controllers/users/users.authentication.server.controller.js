'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  Passport = mongoose.model('Passport'),
  Invitation = mongoose.model('Invitation'),
  shortid = require('shortid'),
  Chance = require('chance'),
  chance = new Chance(),
  Widget = mongoose.model('Widget'),
  FrequentRequest = mongoose.model('FrequentRequest'),
  _ = require('lodash'),
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
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init user and add missing fields

  if(req.body._id !== undefined){
    User.findOne({
      _id: req.body._id
    }).exec(function(err1,userInfo){
      userInfo = _.extend(userInfo,req.body);
      userInfo.save(function (err, theuser) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
            Passport.findOne({
            provider: 'local',
            userId: theuser
          }).exec(function (err, pass) {
            
              pass.password = req.body.password;
              pass.userId = userInfo;
              
              pass.save(function (err) {
                if (err) {
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  req.login(userInfo, function (err) {
                    if (err) {
                      res.status(400).send(err);
                    } else {
                      // _this.createDefaultWidget(user);
                      res.json(userInfo);
                    }
                  });
                }
              });
          });
        }
      });
    });
  }else{
    var user = new User(req.body);
    var nameArray = generateFirstLastName(req.body.name);
    user.firstName = nameArray[0];
    user.lastName = nameArray[1];
    user.displayName = user.firstName + ' ' + user.lastName;
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
            Invitation.findOne({
              'email': user.email,
              'status': 'Pending'
            }).exec(function (err, invitation) {
              if (err) {
                console.info(err);
              } else {
                if (invitation) {
                  user.organization = invitation.organization;
                  user.save(function (err) {
                    if (err) {
                      console.info(err);
                    } else {
                      invitation.status = 'Accepted';
                      invitation.save(function (err) {
                        if (err) {
                          console.info(err);
                        }
                      });
                    }
                  });
                }
              }
            });
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                // _this.createDefaultWidget(user);
                _this.createDefualtFrequentRequest(user);
                res.json(user);
              }
            });
          }
        });
      }
    }); 
  } 
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(422).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res, next) {
  req.logout();

  req.session.destroy(function (err) {
    if (err) { return next(err); }
    res.status(200).send({ message: 'User logged out successfully' });
  });
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    if (req.query && req.query.redirect_to)
      req.session.redirect_to = req.query.redirect_to;

    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {

    // info.redirect_to contains inteded redirect path
    passport.authenticate(strategy, function (err, user, info) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(info.redirect_to || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  // Setup info object
  var info = {};

  // Set redirection path on session.
  // Do not redirect to a signin or signup page
  if (noReturnUrls.indexOf(req.session.redirect_to) === -1)
    info.redirect_to = req.session.redirect_to;

  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              profileImageURL: providerUserProfile.profileImageURL,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            });

            // Email intentionally added later to allow defaults (sparse settings) to be applid.
            // Handles case where no email is supplied.
            // See comment: https://github.com/meanjs/mean/pull/1495#issuecomment-246090193
            user.email = providerUserProfile.email;

            // And save the user
            user.save(function (err) {
              return done(err, user, info);
            });
          });
        } else {
          return done(err, user, info);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, info);
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfileNew = function (req, providerUserProfile, done) {
  // Setup info object
  var info = {};

  // Set redirection path on session.
  // Do not redirect to a signin or signup page
  if (noReturnUrls.indexOf(req.session.redirect_to) === -1)
    info.redirect_to = req.session.redirect_to;

  if (req.user === undefined || req.user === null) {
    User.findOne({
      email: providerUserProfile.email
    }, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          user = new User({
            firstName: providerUserProfile.firstName,
            lastName: providerUserProfile.lastName,
            displayName: providerUserProfile.displayName,
            profileImageURL: providerUserProfile.profileImageURL
          });

          user.email = providerUserProfile.email;

          // And save the user
          user.save(function (err) {
            if (err) {
              return done(err);
            }

            var pass = new Passport();
            pass.provider = providerUserProfile.provider;
            pass.userId = user;
            pass.providerData = providerUserProfile.providerData;
            pass.additionalProvidersData = providerUserProfile.additionalProvidersData;

            pass.save(function (err) {
              if (err) {
                return done(err);
              } else {
                return done(err, user, info);
              }
            });
          });
        } else {
          Passport.findOne({
            userId: user,
            provider: providerUserProfile.provider
          }, function (err, pass) {
            if (err) {
              return done(err);
            }

            if (!pass) {
              pass = new Passport();
            }

            pass.provider = providerUserProfile.provider;
            pass.userId = user;
            pass.providerData = providerUserProfile.providerData;
            pass.additionalProvidersData = providerUserProfile.additionalProvidersData;

            pass.save(function (err) {
              if (err) {
                return done(err);
              } else {
                user.provider = pass.provider;
                user.additionalProvidersData = pass.additionalProvidersData;
                return done(err, user, info);
              }
            });
          });
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, info);
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};

exports.createDefualtFrequentRequest = function(user){
  var fRequestArray = [];
  fRequestArray = getDefualtArray(user);
  if (fRequestArray != null && fRequestArray.length > 0) {
    FrequentRequest.insertMany(fRequestArray, function(err,result){
      if(err) {
        console.log('error occured while inserting default frequent request');
      }else {
        console.log('Successfully created default frequent request');
      }
    });
  }
}

var getDefualtArray = function(user){
  var fRequestArray = [];
  var defaultArray = [
    {
      ownerId: user._id,
      title: 'Water Request',
      message: 'May i please get a glass of water?',
      imageUrl: '/modules/frequentRequest/client/img/water.png'
    },
    {
      ownerId: user._id,
      title: 'Drinks Menu',
      message: 'May i please get the drink menu?',
      imageUrl: '/modules/frequentRequest/client/img/drinks.png'
    },
    {
      ownerId: user._id,
      title: 'Food Request',
      message: 'May i please get the menu card?',
      imageUrl: '/modules/frequentRequest/client/img/food.png'
    },
    {
      ownerId: user._id,
      title: 'ETA?',
      message: 'Can you tell me the ETA for my order?',
      imageUrl: '/modules/frequentRequest/client/img/hourglass.png'
    },
    {
      ownerId: user._id,
      title: 'Attention Please',
      message: 'I have the request for you',
      imageUrl: '/modules/frequentRequest/client/img/bell.png'
    }
  ];

  for (var i = 0; i < defaultArray.length; i++){
    var defaultRequest = new FrequentRequest();
    defaultRequest.ownerId = defaultArray[i].ownerId;
    defaultRequest.title = defaultArray[i].title;
    defaultRequest.message = defaultArray[i].message;
    defaultRequest.imageUrl = defaultArray[i].imageUrl;
    defaultRequest.isDefault = true;
    defaultRequest.isSelected = true;
    fRequestArray.push(defaultRequest);
  }

  return fRequestArray;
};

function generateFirstLastName(fullName) {
  var nameArray = [];
  var firstName = '';
  var lastName = '';

  if (fullName === '' || fullName === undefined) {
    nameArray.push(firstName);
    nameArray.push(lastName);
  }else {
    var fullNameArray = fullName.split(' ');

    if (fullNameArray.length > 1) {
      firstName = fullNameArray[0];
      nameArray.push(firstName);

      for (var i = 1; i < fullNameArray.length; i++) {
        if (fullNameArray.length - 1 === i) {
          lastName = lastName + fullNameArray[i]  
        }else {
          lastName = lastName + fullNameArray[i] + ' ';
        }    
      }
      nameArray.push(lastName);
    }else {
      firstName = fullNameArray[0];
      nameArray.push(firstName);
      nameArray.push(lastName)
    }
  }

  return nameArray;
}
exports.generateFirstLastName = generateFirstLastName;
// exports.createDefaultWidget = function (user) {
//   var widget = new Widget();
//   widget.color = '#78909C';
//   widget.widgetText = 'Ask me anything';
//   widget.imageUrl = '/modules/core/client/img/brand/logo.png';
//   widget.widgetName = 'Default';
//   widget.uniqueCode = shortid.generate();
//   widget.conversationCode = chance.phone().replace('(', '').replace(') ', '-');
//   widget.user = user;

//   widget.save(function (err) {
//     if (err) {
//       console.info(err);
//     }
//   });
// };
