var path = require('path');
var EmitterBase = require(path.join(__base, './server/lib/EmitterBase'));
var moment = require('moment');

var DiagnosticsService = class extends EmitterBase  {
    constructor() {
        super();

        this._runs = new Map();
    }
    
    start(measurement) {
        var _self = this;
        _self._runs.set(measurement, new TimeMeasurement());
    }

    stop(measurement) {
        var _self = this;
        if (!_self._runs.has(measurement)) return null;
        let meas = _self._runs.get(measurement);
        meas.finish();
        return meas.results;
    }

    results(measurement) {
        var _self = this;
        if (!_self._runs.has(measurement)) return null;
        let meas = _self._runs.get(measurement);
        return meas.results;
    }
};

var TimeMeasurement = class {
    constructor(startTime = null) {
        this._start = (!startTime) ? moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS') : startTime;
        this._end = null;
    }

    finish(endTime = null) {
        var _self = this;
        _self._end = (!endTime) ? moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS') : endTime;
    }

    get results() {
        var _self = this;
        var _duration = (!_self._end) ? null : moment.duration(moment(_self._end).diff(moment(_self._start))); 
        var rtn = {
            started: moment(_self._start).format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            finished: (!_self._end) ? '' : moment(_self._end).format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
            duration: (!_self._end) ? null : {
                ms: _duration.asMilliseconds(),
                sec: _duration.asMilliseconds()/1000,
                min: _duration.asSeconds()/60,
                hr: _duration.asSeconds()/3600
            }
        };
        return rtn;
    }
}

module.exports = DiagnosticsService;
