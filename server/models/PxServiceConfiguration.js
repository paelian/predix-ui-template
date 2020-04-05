
class PxServiceConfiguration {
    constructor(vcapConfig) {

        this._currentState = vcapConfig;
    }

    get uri() {
        if (this._currentState.hasOwnProperty("credentials")) {
            if (this._currentState.credentials.hasOwnProperty("uri")) {
                return this._currentState.credentials.uri;
            }                
        }
        return '';
    }

    get zoneId() {
        if (this._currentState.hasOwnProperty("credentials")) {
            if (this._currentState.credentials.hasOwnProperty("zone")) {
                if (this._currentState.credentials.zone.hasOwnProperty("http-header-value")) {
                    return this._currentState.credentials.zone["http-header-value"];
                }
            }                
        }
        return '';
    }

    get credentials() {
        if (this._currentState.hasOwnProperty("credentials")) {
            if (this._currentState.credentials.hasOwnProperty("client_name") && this._currentState.credentials.hasOwnProperty("client_secret")) {
                return new Buffer(this._currentState.credentials.client_name + ':' + this._currentState.credentials.client_secret).toString('base64');
            }                
        }
        return '';
    }

    get clientId() {
        if (this._currentState.hasOwnProperty("credentials")) {
            if (this._currentState.credentials.hasOwnProperty("client_name")) {
                return this._currentState.credentials.client_name;
            }                
        }
        return '';        
    }
}


module.exports = PxServiceConfiguration;
