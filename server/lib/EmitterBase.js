'use strict';
var EventEmitter = require('events');

var EmitterBase = class {

    constructor() {
        this._emitter = new EventEmitter();
    }

    on(event, cb) {
        var _self = this;
        _self._emitter.on(event, cb);
    }

    emit(event, ...args) {
        var _self = this;
        _self._emitter.emit(event, ...args);
    }

}

module.exports = EmitterBase;
