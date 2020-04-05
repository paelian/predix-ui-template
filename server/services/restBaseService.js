var path = require('path');
var BaseService = require(path.join(__base, './server/services/baseService'));
var rp = require('request-promise');

var RestBaseService = class extends BaseService {
    constructor(dataServiceConfig, uaaConfig = null) {
        super();

        this._uaaUri = (uaaConfig && uaaConfig.uaaUri) ? uaaConfig.uaaUri : null;
        this._clientCredential = (uaaConfig && uaaConfig.clientCredential) ? uaaConfig.clientCredential : null;
        this._zoneId = (uaaConfig && uaaConfig.zoneId) ? uaaConfig.zoneId : null;
        this._lastToken = null;

        this._config = dataServiceConfig;

        var buildEndpointMap = (configs) => {
            let rtn = new Map([]);
            for (let c of configs) {
                rtn.set(c.name, c);
            }
            return rtn;
        };

        this._endpoints = (this._config && this._config.endPoints) ? buildEndpointMap(this._config.endPoints) : new Map([]);
    }

    get config() { return this._config; }

    get uri() { return (this._config && this._config.uri) ? this._config.uri : null; }

    get endPoints() { return this._endpoints; }

    async restReq(endpoint, params, options) {
        var _self = this;
        var defaultOptions = { method: 'GET', json: true };
        var defaultParams = {};
        var _params = Object.assign(defaultParams, params);
        var _paramstr = '';
        for (let param of Object.keys(_params)) {
            let str = `${param}='${_params[param]}'`;
            _paramstr += ((_paramstr.length > 0) ? '&' : '?') + str;
        }

        var _url = ((endpoint && endpoint.length > 0) ? (endpoint.indexOf('https://') > -1 || endpoint.indexOf('http://') > -1) ? endpoint : _self._config.uri + endpoint : _self._config.uri);
        var _options = Object.assign(defaultOptions, options, {
            url: _url,
            headers: {
                "Authorization": "Basic " + this._config.credentials
            }
        });
        switch (_options.method.toLowerCase()) {
            case 'post':
                _options.body = _params;
                break;
            default: //get
                _options.qs = _params;
        }
        return await new Promise(async (resolve, reject) => {
            rp(_options).then(rtn => {
                resolve(rtn);
            }).catch(err => {
                reject(err);
            })
        });
    }

    checkToken(req) {
        var _self = this;

        var _ext_access_token = "";
        if (req &&
            req.hasOwnProperty("header") &&
            req.header.hasOwnProperty("access_token") &&
            req.header.access_token.length > 0) {
            _ext_access_token = req.header.access_token;
        }
        else {
            _ext_access_token = _self.lastToken.access_token;
        }
        var checkTokenOptions = {
            uri: this.UAAUri + '/check_token',
            qs: {
                token: _ext_access_token
            },
            headers: {
                "Authorization": "Basic " + _self.Cred
            },
            json: true
        };

        return new Promise((resolve, reject) => {
            rp(checkTokenOptions).then(data => {
                resolve(data);
            }).catch(err => {
                reject(err);
            });

        });
    }

    async refreshToken() {
        var _self = this;

        var options = {
            uri: this._uaaUri + '/oauth/token',
            qs: {
                grant_type: 'client_credentials'
            },
            headers: {
                "Authorization": "Basic " + _self._clientCredential
            },
            json: true
        };

        // Retrieve token    
        return await new Promise(async (resolve, reject) => {

            if (_self._uaaUri.length === 0) {
                resolve('');
                return;
            }
            if (this._lastToken != null) {
                if (Date.now() < (this._lastToken.expires_in * 1000 + this._lastToken.retrieved_on.getTime())) {
                    resolve(this._lastToken.access_token);
                    return;
                }
            }

            var timestamp = new Date();
            rp(options).then(data => {

                // if (req &&
                //     req.hasOwnProperty("session") &&
                //     req.session.hasOwnProperty("userTokenData")) {
                //     var phdatafield = true;
                // }

                this._lastToken = data;
                this._lastToken.retrieved_on = timestamp;
                resolve(this._lastToken.access_token);
            }).catch(err => {
                reject(err);
            });

        });

    }

    async getProtectedRequest(url, zoneId = null) {
        var _self = this;
        return await new Promise(async (resolve, reject) => {
            try {
                let token = await _self.refreshToken();
                var options = {
                    uri: url,
                    headers: {
                        "Content-Type": "application/json; charSet=utf-8"
                    },
                    json: true
                };
                if (typeof zoneId === 'string') {
                    options.headers["Predix-Zone-Id"] = zoneId;
                }
                if (token !== '') {
                    options.headers.Authorization = "bearer " + token;
                }
                rp(options).then(rtn => {
                    resolve(rtn);
                })
                    .catch(err => {
                        throw new Error(e);
                    });

            } catch (e) {
                reject(e);
            }
        });
    }

    async postProtectedRequest(url, zoneId = null) {
        var _self = this;
        return await new Promise(async (resolve, reject) => {
            try {
                let token = await _self.refreshToken();
                var options = {
                    method: 'POST',
                    uri: url,
                    headers: {
                        "Content-Type": "application/json; charSet=utf-8"
                    },
                    json: true
                };
                if (typeof zoneId === 'string') {
                    options.headers["Predix-Zone-Id"] = zoneId;
                }
                if (token !== '') {
                    options.headers.Authorization = "bearer " + token;
                }
                rp(options).then(rtn => {
                    resolve(rtn);
                })
                    .catch(err => {
                        throw new Error(e);
                    });

            } catch (e) {
                reject(e);
            }
        });
    }

    // #region Helpers

    _checkRestRequestBodyForErrors(body) {
        if (typeof body === 'string') {
            if (body.indexOf('404 Not Found') >= 0) {
                return true;
            }
        }
        return false;
    }

    // #endregion

};

module.exports = RestBaseService;
