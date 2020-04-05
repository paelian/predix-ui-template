var express = require('express');
var router = express.Router();
var BaseController = require('./baseController');
var rp = require('request-promise');
var fs = require('fs');
var path = require('path');
var request = require('request');
var moment = require('moment');

var UaaController = class extends BaseController {
  constructor(predixConfig) {
    super();

    this._config = predixConfig;
  }

  authorizationLogin(req, res) {
    var _self = this;
    res.redirect(_self._config.uaa.uri + '/oauth/authorize?client_id=' + _self._config.uaa.clientId + '&response_type=code&redirect_uri=' + ((req.headers.host.indexOf(".predix.io") > -1) ? "https://" : "http://") + req.headers.host + '/uaa/callback');
  }

  authorizationLogout(req, res) {
    var _self = this;
    req.session.destroy();
    res.redirect(_self._config.uaa.uri + '/logout?redirect=' + ((req.headers.host.indexOf(".predix.io") > -1) ? "https://" : "http://") + req.headers.host);
  }

  authorizationUserInfo(req, res) {
    var _self = this;
    if (!req.session.tokenData) {
      res.json(Models.PxaResults.err('Invalid token! Request rejected.'));
      return;
    }

    var token = req.session.tokenData;
    var options = {
      url: _self._config.uaa.uri + '/userinfo',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token.access_token
      }
    };

    rp(options).then((rtn) => {
      var data = JSON.parse(rtn);
      data.retrieved_on = Date.now();
      res.json(data);
    }).catch((err) => {
      res.json(Models.PxaResults.err(err));
    });
  }

  decodeUserInfoFromToken(req, res) {
    var _self = this;
    if (!req.session.tokenData) {
      res.json(Models.PxaResults.err('Invalid token! Request rejected.'));
      return;
    }

    var token = req.session.tokenData;
    var jwtTokenData = require(path.join(__base, '/server/models/jwtTokenData'));
    var jwt = new jwtTokenData(token.access_token);
    res.json(jwt.body);
  }

  callbackHandler(req, res) {
    var _self = this;
    req.session._isredirecting = false;
    var authCode = req.query.code.toString();
    // Based on env set options variable
    var options = {
      uri: _self._config.uaa.uri + '/oauth/token',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Authorization': 'Basic ' + _self._config.uaa.credentials
      },
      form: {
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: ((req.headers.host.indexOf(".predix.io") > -1) ? "https://" : "http://") + req.headers.host + '/uaa/callback'
      }
    };

    return new Promise((resolve, reject) => {
      rp(options).then((rtn) => {
        var data = JSON.parse(rtn);
        data.retrieved_on = Date.now();
        resolve(data);
      }).catch((err) => {
        reject({ error: err });
      });
    }).then((data) => {
      req.session.tokenData = data;
      res.redirect('/');
    }).catch((err) => {
      console.error({ error: err }); // <-- this should be a flash error
    });
  }

  checkToken_old(req, res) {
    var token;
    if (req.session.tokenData) {
      token = req.session.tokenData;
      if (Date.now() > ((86400 * 1000) + token.retrieved_on))
        res.status(200).json({ state: -1, desc: 'Expired token. Must login.' });
      else
        res.status(200).json({ state: 1, desc: 'Everything is ok.' });
    } else {
      res.status(200).json({ state: -1, desc: 'No token data found. Must login' });
    }
  }

  checkToken(req, res) {
    var token;
    if (req.session.tokenData) {
      token = req.session.tokenData;
      if (Date.now() > (tokenData.expires_in * 1000 + tokenData.retrieved_on)) 
        res.status(200).json({ state: -1, desc: 'Expired token. Must login.' });
      else
        res.status(200).json({ state: 1, desc: 'Everything is ok.' });
    } else {
      res.status(200).json({ state: -1, desc: 'No token data found. Must login' });
    }
  }

  checkTokenHeartbeat(req, res) {
    let _now = moment(Date.now());
    if (req.session && req.session.token_last_checked) {
      let _ref = moment(req.session.token_last_checked);
      let _diff = moment(_now.diff(_ref)).format('ss.SSSSSS');
      if (parseFloat(_diff) < 120) { // if over 2 min since last heartbeat, he's dead jim
        return true;
      }
    }
    return false;
  }

  refreshToken(tokenData, req) {
    var _self = this;
    var options = {};
    return new Promise((resolve, reject) => {
      if (tokenData != null) {
        if (Date.now() < (tokenData.expires_in * 1000 + tokenData.retrieved_on)) {
          resolve(tokenData);
        } else {
          options = {
            uri: _self._config.uaa.uri + '/oauth/token',
            method: 'POST',
            headers: {
              'Cache-Control': 'no-cache',
              'Authorization': 'Basic ' + _self._config.uaa.credentials
            },
            form: {
              grant_type: 'refresh_token',
              refresh_token: tokenData.refresh_token
            }
          };
        }
      } else {
        console.error("Token data not found.");
      }

      rp(options).then((rtn) => {
        var data = JSON.parse(rtn);
        data.retrieved_on = Date.now();
        req.session.tokenData = data;
        resolve(data);
      }).catch((err) => {
        reject({ error: err });
      });
    });
  }

  tokenIsExpired(tokenData) {
    return (Date.now() > (tokenData.expires_in * 1000 + tokenData.retrieved_on));
  }

};

var routerMain = function (obj) {
  var controller = new UaaController(obj);

  router.route('').get(controller.authorizationLogin.bind(controller));

  router.route('/callback').get(controller.callbackHandler.bind(controller));

  router.route('/userinfo').get(controller.decodeUserInfoFromToken.bind(controller));

  router.route('/logout').get(controller.authorizationLogout.bind(controller));

  router.route('/checkToken').get(controller.checkToken.bind(controller));

  return router;
};

module.exports = UaaController;
module.exports.router = routerMain;
