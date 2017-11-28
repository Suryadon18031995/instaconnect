'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Widget = mongoose.model('Widget'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  widget;

/**
 * Widget routes tests
 */
describe('Widget CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Widget
    user.save(function () {
      widget = {
        name: 'Widget name'
      };

      done();
    });
  });

  it('should be able to save a Widget if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Widget
        agent.post('/api/widgets')
          .send(widget)
          .expect(200)
          .end(function (widgetSaveErr, widgetSaveRes) {
            // Handle Widget save error
            if (widgetSaveErr) {
              return done(widgetSaveErr);
            }

            // Get a list of Widgets
            agent.get('/api/widgets')
              .end(function (widgetsGetErr, widgetsGetRes) {
                // Handle Widgets save error
                if (widgetsGetErr) {
                  return done(widgetsGetErr);
                }

                // Get Widgets list
                var widgets = widgetsGetRes.body;

                // Set assertions
                (widgets[0].user._id).should.equal(userId);
                (widgets[0].name).should.match('Widget name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Widget if not logged in', function (done) {
    agent.post('/api/widgets')
      .send(widget)
      .expect(403)
      .end(function (widgetSaveErr, widgetSaveRes) {
        // Call the assertion callback
        done(widgetSaveErr);
      });
  });

  it('should not be able to save an Widget if no name is provided', function (done) {
    // Invalidate name field
    widget.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Widget
        agent.post('/api/widgets')
          .send(widget)
          .expect(400)
          .end(function (widgetSaveErr, widgetSaveRes) {
            // Set message assertion
            (widgetSaveRes.body.message).should.match('Please fill Widget name');

            // Handle Widget save error
            done(widgetSaveErr);
          });
      });
  });

  it('should be able to update an Widget if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Widget
        agent.post('/api/widgets')
          .send(widget)
          .expect(200)
          .end(function (widgetSaveErr, widgetSaveRes) {
            // Handle Widget save error
            if (widgetSaveErr) {
              return done(widgetSaveErr);
            }

            // Update Widget name
            widget.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Widget
            agent.put('/api/widgets/' + widgetSaveRes.body._id)
              .send(widget)
              .expect(200)
              .end(function (widgetUpdateErr, widgetUpdateRes) {
                // Handle Widget update error
                if (widgetUpdateErr) {
                  return done(widgetUpdateErr);
                }

                // Set assertions
                (widgetUpdateRes.body._id).should.equal(widgetSaveRes.body._id);
                (widgetUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Widgets if not signed in', function (done) {
    // Create new Widget model instance
    var widgetObj = new Widget(widget);

    // Save the widget
    widgetObj.save(function () {
      // Request Widgets
      request(app).get('/api/widgets')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Widget if not signed in', function (done) {
    // Create new Widget model instance
    var widgetObj = new Widget(widget);

    // Save the Widget
    widgetObj.save(function () {
      request(app).get('/api/widgets/' + widgetObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', widget.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Widget with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/widgets/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Widget is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Widget which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Widget
    request(app).get('/api/widgets/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Widget with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Widget if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Widget
        agent.post('/api/widgets')
          .send(widget)
          .expect(200)
          .end(function (widgetSaveErr, widgetSaveRes) {
            // Handle Widget save error
            if (widgetSaveErr) {
              return done(widgetSaveErr);
            }

            // Delete an existing Widget
            agent.delete('/api/widgets/' + widgetSaveRes.body._id)
              .send(widget)
              .expect(200)
              .end(function (widgetDeleteErr, widgetDeleteRes) {
                // Handle widget error error
                if (widgetDeleteErr) {
                  return done(widgetDeleteErr);
                }

                // Set assertions
                (widgetDeleteRes.body._id).should.equal(widgetSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Widget if not signed in', function (done) {
    // Set Widget user
    widget.user = user;

    // Create new Widget model instance
    var widgetObj = new Widget(widget);

    // Save the Widget
    widgetObj.save(function () {
      // Try deleting Widget
      request(app).delete('/api/widgets/' + widgetObj._id)
        .expect(403)
        .end(function (widgetDeleteErr, widgetDeleteRes) {
          // Set message assertion
          (widgetDeleteRes.body.message).should.match('User is not authorized');

          // Handle Widget error error
          done(widgetDeleteErr);
        });

    });
  });

  it('should be able to get a single Widget that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Widget
          agent.post('/api/widgets')
            .send(widget)
            .expect(200)
            .end(function (widgetSaveErr, widgetSaveRes) {
              // Handle Widget save error
              if (widgetSaveErr) {
                return done(widgetSaveErr);
              }

              // Set assertions on new Widget
              (widgetSaveRes.body.name).should.equal(widget.name);
              should.exist(widgetSaveRes.body.user);
              should.equal(widgetSaveRes.body.user._id, orphanId);

              // force the Widget to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Widget
                    agent.get('/api/widgets/' + widgetSaveRes.body._id)
                      .expect(200)
                      .end(function (widgetInfoErr, widgetInfoRes) {
                        // Handle Widget error
                        if (widgetInfoErr) {
                          return done(widgetInfoErr);
                        }

                        // Set assertions
                        (widgetInfoRes.body._id).should.equal(widgetSaveRes.body._id);
                        (widgetInfoRes.body.name).should.equal(widget.name);
                        should.equal(widgetInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Widget.remove().exec(done);
    });
  });
});
