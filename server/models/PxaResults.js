'use strict';
    class PxaResults {
        constructor(type, errmsg, results) {
            this._validStates = new Map([
                ['OK', { value: 0, msg: 'OK', results }],
                ['Error', { value: -1, msg: 'Error occurred: ' + errmsg, results }],
                ['BadToken', { value: -2, msg: 'Error occurred: ' + errmsg, results }],
                ['NotSet', { value: -99, msg: 'NotSet' }]
            ]);

            this._currentState = (type) ? this._validStates.get(type) : this._validStates.get('NotSet');
        }

        get state() { return this._currentState; }
    }


module.exports = PxaResults;
module.exports.ok = function (results) { return (new PxaResults('OK', null, results)).state; };
module.exports.err = function (msg, results) { return (new PxaResults('Error', msg, results)).state; };
module.exports.badtoken = function (msg, results) { return (new PxaResults('BadToken', msg, results)).state; };
