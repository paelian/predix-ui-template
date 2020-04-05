class JwtTokenData {
    constructor(token) {
        this._token = token;
    }
    
    get header() {
        var _self = this;
        var buff = new Buffer(_self._token.split(/\./g)[0], 'base64');
        return JSON.parse(buff.toString('ascii'));
    }

    get body() {
        var _self = this;
        var buff = new Buffer(_self._token.split(/\./g)[1], 'base64');
        return JSON.parse(buff.toString('ascii'));
    }
    
};

module.exports = JwtTokenData;