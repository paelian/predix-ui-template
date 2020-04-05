'use strict';
class PxBlobServiceConfiguration {
    constructor(vcapConfig) {

        this._currentState = vcapConfig;
    }

    get uri() {
        if (this._currentState.hasOwnProperty("credentials")) {
            if (this._currentState.credentials.hasOwnProperty("url")) {
                return this._currentState.credentials.url;
            }                
        }
        return '';
    }

    get bucket() {
        if (this._currentState.hasOwnProperty("credentials")) {
            if (this._currentState.credentials.hasOwnProperty("bucket_name")) {
                return this._currentState.credentials.bucket_name;
            }                
        }
        return '';
    }

    get credentials() {
        if (this._currentState.hasOwnProperty("credentials")) {
                return this._currentState.credentials;
        }
        return null;
    }

    get region() {
        if (this.uri.indexOf('s3-us-west-2.amazonaws.com') > -1) {
            return 'us-west-2';
        }
        return '';
    }
}


module.exports = PxBlobServiceConfiguration;
