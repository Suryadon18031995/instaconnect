'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    // uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/growth-app',
    // uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://ds115752.mlab.com:15752/instaconnect_2',
    uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/instaconnect',

    // options: {
    //   user: 'instaconnect',
    //   pass: 'instaconnect@123'
    // },
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    fileLogger: {
      directoryPath: process.cwd(),
      fileName: 'app.log',
      maxsize: 10485760,
      maxFiles: 2,
      json: false
    }
  },
  app: {
    title: defaultEnvConfig.app.title
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || '1727220234207671',
    clientSecret: process.env.FACEBOOK_SECRET || '72726011b95b6432d70304bffe425fc4',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    username: '@TWITTER_USERNAME',
    clientID: process.env.TWITTER_KEY || 'wboRZeDOguSF4aqpTxIrlCtjR',
    clientSecret: process.env.TWITTER_SECRET || 'V6CbQpJ6Q2ChFT25MGwl6FIoHofwj6bEY4GiqG318t70aaNyBp',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || '1020367184484-fgqdf45glf9foevjovjuag34gfhm25cn.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'RzK5MJ-q3HLqy1-Hgp_NdiFj',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || '694af9d8a96b8cf2b45f',
    clientSecret: process.env.GITHUB_SECRET || '56331b46d8af02bfe56617d17dd9fd51b9ed4d49',
    callbackURL: '/api/auth/github/callback'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: true
  },
  mailer: {
    from: process.env.MAILER_FROM || 'no-reply@instaconnectapp.com',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'santosh@sharan.me',
        pass: process.env.MAILER_PASSWORD || 'InstaConnectPass#1'
      }
    },
    postmarkServerToken: '9b33b1e8-5da0-442f-998e-bea3699d8cf2'
  },
  firebase: {
    apiKey: 'AIzaSyD8y-Pw8rbzT1nxifsAMb00kW5z4W-hBJM',
    authDomain: 'instaconnect-dca25.firebaseapp.com',
    databaseURL: 'https://instaconnect-dca25.firebaseio.com',
    storageBucket: 'instaconnect-dca25.appspot.com'
  },
  livereload: true,
  seedDB: {
    seed: process.env.MONGO_SEED === 'true',
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS !== 'false',
      seedUser: {
        username: process.env.MONGO_SEED_USER_USERNAME || 'seeduser',
        provider: 'local',
        email: process.env.MONGO_SEED_USER_EMAIL || 'user@localhost.com',
        firstName: 'User',
        lastName: 'Local',
        displayName: 'User Local',
        roles: ['user']
      },
      seedAdmin: {
        username: process.env.MONGO_SEED_ADMIN_USERNAME || 'seedadmin',
        provider: 'local',
        email: process.env.MONGO_SEED_ADMIN_EMAIL || 'admin@localhost.com',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        roles: ['user', 'admin']
      }
    }
  }
};
