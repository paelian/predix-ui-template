// var remoteConsole = require('pxa-remoteconsole');

const path = require('path');
global.__base = path.join(__dirname + '/..');
const fs = require('fs');
global.ext = require('./lib/extensions');

const http = require('http'); // needed to integrate with ws package for mock web socket server.
const express = require('express');
const app = express();
const httpServer = http.createServer(app);

// Set up remote console (logging via socket.io)
// var rc = remoteConsole(httpServer, {});

var cors = require('cors'), corsOptions = { origin: (origin, cb) => { cb(null, true); }, credentials: true };

var session = require('express-session');
var cookieParser = require('cookie-parser'); // used for session cookie
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var node_env = process.env.node_env || 'cloud';
console.log('************ Environment: ' + node_env + '******************');

// Models
global.Models = {
  PxaResults: require('./models/PxaResults')

};

//ViewModels
global.ViewModels = {
  FileVM: require('./viewmodel/FileVM')

};

// Service Configuration
var pxserviceconfigfile = './cf.json';
var serviceConfiguration = require(pxserviceconfigfile).VCAP_SERVICES;
// var PxServiceConfiguration = require('./models/PxServiceConfiguration');
// var PxUAAServiceConfiguration = require('./models/PxUAAServiceConfiguration');
// var PxBlobServiceConfiguration = require('./models/PxBlobServiceConfiguration');
// var PxTimeseriesServiceConfiguration = require('./models/PxTimeseriesServiceConfiguration');
// var PxPostgresServiceConfiguration = require('./models/PxPostgresServiceConfiguration');
// var manifestConfig = require('read-yaml').sync(path.join(__base, 'manifest.yml'));
var readAppUrl = () => { return (process && process.env && process.env.VCAP_APPLICATION && process.env.VCAP_APPLICATION.uris && process.env.VCAP_APPLICATION.urls.length() > 0) ? process.env.VCAP_APPLICATION.uris[0] : null; };
var predixConfig = {
  url: (readAppUrl()) ? `https://${readAppUrl()}` : `http://localhost:${process.env.PORT || 6309}`,
  uuid: serviceConfiguration["appUuid"] || 'blobstore-viewer',
  // uaa: new PxUAAServiceConfiguration(serviceConfiguration["predix-uaa"][0]),
  // blob: new PxBlobServiceConfiguration(serviceConfiguration["predix-blobstore"][0]),
  // postgres: new PxPostgresServiceConfiguration(serviceConfiguration["postgres-2.0"][0], node_env)
  // asset: new PxServiceConfiguration(serviceConfiguration["predix-asset"][0])
}
var buildDataServiceMap = (configs) => {
  let DataServiceConfiguration = require(path.join(__base, '/server/models/DataServiceConfiguration'));
  let rtn = new Map([]);
  for (let c of configs) {
    let o = new DataServiceConfiguration(c);
    rtn.set(o.name, o);
  }
  return rtn;
}
var dataServiceConfig = (serviceConfiguration.appDataServices) ? buildDataServiceMap(serviceConfiguration["appDataServices"]) : new Map([]);
var appSettings = (serviceConfiguration.appSettings) ? serviceConfiguration.appSettings : { disableUAA: false };

/**********************************************************************
       SETTING UP EXRESS SERVER
***********************************************************************/
app.set('trust proxy', 1);
app.use(cors(corsOptions)); // allow cross origin requests for testing

app.use(require('compression')()) // gzip compression
app.use(favicon(path.join(__base, '/public/favicon.ico')));

// Session Storage Configuration:
// *** Use this in-memory session store for development only. Use redis for prod. **
var sessionOptions = {
  secret: 'predixsample',
  name: 'cendgapp', // give a custom name for your cookie here
  // maxAge: 30 * 60 * 1000,  // expire token after 30 min.
  proxy: true,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // secure: true, // secure cookie is preferred, but not possible in some clouds.
    expires: true,
    maxAge: 30 * 60 * 1000, // 30 min, after this, forced to log back in
  }
};
if (serviceConfiguration.express && serviceConfiguration.express.redisCache) {
  const redis = require('redis');
  const redisClient = redis.createClient(serviceConfiguration.express.redisCache);
  const redisStore = require('connect-redis')(session);
  redisClient.on('error', err => {
    console.log('REDIS ERROR: ', err);
  });
  sessionOptions = {
    secret: `redisSessionStore__${serviceConfiguration.appUuid}`,
    name: `${serviceConfiguration.appUuid}`,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new redisStore({ client: redisClient })
  };
} else {
  app.use(cookieParser('predixsample'));
}
app.use(session(sessionOptions));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__base, 'public', 'favicon.ico')));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));

/****************************************************************************
 * UAA/PASSPORT/PFT CONFIGURATION
/****************************************************************************/
if (!appSettings.disableUAA) {

  var UaaController = require('./controllers/uaaController');
  app.use('/uaa', UaaController.router(predixConfig));
  app.use('/login', function (req, res, next) { res.redirect('/uaa/login'); });
  app.use('/logout', function (req, res, next) { res.redirect('/uaa/logout'); });
  app.use('/userinfo', function (req, res, next) { res.redirect('/uaa/userinfo'); });

  // #region New UAA protection
  app.all('*', (req, res, next) => {

    //   // console.log(`session check: ${(new Date(Date.now()))}, ${req.session.cookie.expires}, ${req.session.tokenData}, ${(req.session.tokenData) ? req.session.tokenData.expires_in : ''}, ${(req.session.tokenData) ? req.session.tokenData.retrieved_on : ''}, heartbeat on: ${req.session.token_last_checked}`)

    var uaacontroller = new UaaController(predixConfig);
    var reqhtmltype = (req && req.headers && req.headers.accept) ? req.headers.accept.indexOf('text/html') > -1 : false;
    if (req.session.tokenData && !uaacontroller.tokenIsExpired(req.session.tokenData)) {
      if (reqhtmltype && !uaacontroller.checkTokenHeartbeat(req)) { // need the checkTokenHeartbeat check here for the case where the user shuts down the browser without logging out first
        // try to expire / force re-login
        req.session._isredirecting = true;
        res.sendFile(path.join(__base, '/public/logout.html')); // send a logout page with a browser logout script to avoid the "too many redirects" issue with UAA
      } else {
        next();
      }
    } else {
      if (reqhtmltype && req.session && !req.session._isredirecting) { // only intercept html responses on this level, REST requests should be handled differently
        req.session._isredirecting = true;
        req.session.token_last_checked = Date.now();
        res.redirect('/uaa');
      }
      else {
        if (reqhtmltype) {
          res.sendFile(path.join(__base, '/public/logout.html')); // send a logout page with a browser logout script to avoid the "too many redirects" issue with UAA
        } else {
          // can assume request is a REST request here, try sending a redirect/invalid token response if needed
          res.json(Models.PxaResults.badtoken('Invalid token! Request rejected.'));
        }
      }
    }

  });

}

app.use('/heartbeat', function (req, res, next) {
  req.session.token_last_checked = Date.now();
  res.json(Models.PxaResults.ok('...dub')); // lub...
});

// #endregion

// Validate user token if provided
// app.use(require('express-bearer-token')(), (req, res, next) => {
//   if (req && req.hasOwnProperty("token") && req.token !== undefined) {
//     var pft = require('predix-fast-token');
//     var JwtTokenData = require('./models/jwtTokenData');
//     var _token = JSON.parse(JSON.stringify(req.token));
//     var _tokenData = new JwtTokenData(_token);
//     var _issuers = [predixConfig.uaa.issuerId];
//     pft.verify(_token, _issuers).then(decoded => {
//       next();      
//     }).catch(err => { 
//       res.json(Models.PxaResults.err(err)); 
//     });
//   }
//   else {
//     if (node_env === 'development') { // if development environment, a UAA user token is not required, so continue
//       next();
//     }
//     else {
//       res.json(Models.PxaResults.err("Authorization required"));
//     }
//   }
// });

/****************************************************************************
	SET UP EXPRESS ROUTES
*****************************************************************************/

app.use(express.static(path.join(__base, '/public')));
app.use('/node_modules', express.static(path.join(__base, '/node_modules')));
app.use('/webcomponents', express.static(path.join(__base, '/node_modules/@webcomponents')));
app.use('/polymer', express.static(path.join(__base, '/node_modules/@polymer')));

//  --> dynamically include routes (Controllers)
fs.readdirSync('./server/controllers').forEach(function (file) {
  if (file.substr(-9) === 'Router.js') {
    var rname = file.replace(file.substr(-3), '').replace('Router', '');
    var route = require('./controllers/' + file)(predixConfig, dataServiceConfig);
    app.use('/' + rname, route);
  }
});



////// error handlers //////
// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler - prints stacktrace
if (node_env === 'development') {
  app.use(function (err, req, res, next) {
    if (!res.headersSent) {
      res.status(err.status || 500);
      res.send({
        message: err.message,
        error: err
      });
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  if (!res.headersSent) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: {}
    });
  }
});

httpServer.listen(process.env.VCAP_APP_PORT || process.env.PORT || 6309, function () {
  console.log('Server started on port: ' + httpServer.address().port);
});

module.exports = app;