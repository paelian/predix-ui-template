var PxServiceConfiguration = require('./PxServiceConfiguration');

class PxUAAServiceConfiguration extends PxServiceConfiguration {
    constructor(vcapConfig) {
        super(vcapConfig);
    }

    get issuerId() {
        if (this._currentState.hasOwnProperty("credentials")) {
            if (this._currentState.credentials.hasOwnProperty("issuerId")) {
                return this._currentState.credentials.issuerId;
            }                
        }
        return '';        
    }

    get base64ClientCredential() {
        if (process && process.env && process.env.base64ClientCredential) return process.env.base64ClientCredential;
        if (this._currentState.credentials && this._currentState.credentials.client_name && this._currentState.credentials.client_secret) {
            return Buffer.from(`${this._currentState.credentials.client_name}:${this._currentState.credentials.client_secret}`).toString('base64');
        }
        return null;
    }
}


module.exports = PxUAAServiceConfiguration;
