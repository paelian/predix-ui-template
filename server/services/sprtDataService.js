var path = require('path');
var request = require('request');
var RestBaseService = require(path.join(__base, './server/services/restBaseService'));

const SprtDataService = class extends RestBaseService {
    constructor(dataServiceConfig) {
        super(dataServiceConfig);

    }

    async getQry(url) {
        var _self = this;
        var endpointMethod = _self.endPoints.get('townships');
        return await new Promise(async (resolve, reject) => {
            try {
                if (_self._uaaUri && _self._clientCredential) {
                    let results = await _self.getProtectedRequest(url);
                    if (results && results.value && results.value < 0) {
                        reject(results.msg); return;
                    }
                    resolve(JSON.stringify(results));
                } else {
                    request.get({ url: url }, function (err, httpResponse, body) {
                        if (err) {
                            reject(err); return;
                        }
                        if (httpResponse === undefined || body === undefined) {
                            reject(`There was a problem reach the url specified: ${url}`); return;
                        }
                        if (body.indexOf('500 Internal Server Error') > -1) {
                            reject(`Endpoint returned 500 Internal Server Error (${url})`); return;
                        }
                        let results = JSON.parse(body);
                        if (results && results.value && results.value < 0) {
                            reject(results.msg); return;
                        }
                        resolve(body);
                    });
                }
            } catch (e) {
                reject(e);
            }
        });
    }

}

module.exports = SprtDataService;