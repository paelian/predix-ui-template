'use strict';
class PxPostgresServiceConfiguration {
    constructor(vcapConfig, env) {

        this._currentState = vcapConfig;
        this._env = env;
    }

    get credentials() {
        if (this._currentState.hasOwnProperty("credentials")) {
            let rtn = this._currentState.credentials;
            if (this._env === 'development' && this._currentState.hasOwnProperty("development_credentials")) rtn = Object.assign(rtn, this._currentState["development_credentials"]);
            return rtn;
        }
        return null;
    }
}


module.exports = PxPostgresServiceConfiguration;
