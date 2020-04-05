
class DataServiceConfiguration {
    constructor(vcapConfig) {

        this._currentState = vcapConfig;
    }

    get name() {
        if (this._currentState.hasOwnProperty("name")) {
            return this._currentState.name;
        }                
        return '';
    }

    get uri() {
        if (this._currentState.hasOwnProperty("uri")) {
            return this._currentState.uri;
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

    get endPoints() {
        if (this._currentState.hasOwnProperty('endpoints')) {
            return this._currentState.endpoints;
        }
        return [];
    }
}


module.exports = DataServiceConfiguration;
