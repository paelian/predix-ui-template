var util = require('util');

// ----------------------
// Date format prototype

Date.prototype.format = function (f) {
    if (!this.valueOf()) {
        return '&nbsp;';        
    }

    var d = this;

    var gsDayNames = new Array(
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    );

    var gsMonthNames = new Array(
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    );
    var h = 0;
    
    return f.replace(/(yyyy|yy|y|MMMM|MMM|MM|M|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|t)/gi,
        function ($1) {
            switch ($1) {
                case 'yyyy':
                    return d.getFullYear();
                case 'yy':
                    return (d.getFullYear() % 100).toString().padleft('0', 2);
                case 'y':
                    return (d.getFullYear() % 100);
                case 'MMMM':
                    return gsMonthNames[d.getMonth()];
                case 'MMM':
                    return gsMonthNames[d.getMonth()].substr(0, 3);
                case 'MM':
                    return (d.getMonth() + 1).toString().padleft('0', 2);
                case 'M':
                    return (d.getMonth() + 1);
                case 'dddd':
                    return gsDayNames[d.getDay()];
                case 'ddd':
                    return gsDayNames[d.getDay()].substr(0, 3);
                case 'dd':
                    return d.getDate().toString().padleft('0', 2);
                case 'd':
                    return d.getDate();
                case 'HH':
                    return d.getHours().toString().padleft('0', 2);
                case 'H':
                    return d.getHours();
                case 'hh':
                    return ((h = d.getHours() % 12) ? h : 12).padleft('0', 2);
                case 'h':
                    return ((h = d.getHours() % 12) ? h : 12);
                case 'mm':
                    return d.getMinutes().toString().padleft('0', 2);
                case 'm':
                    return d.getMinutes();
                case 'ss':
                    return d.getSeconds().toString().padleft('0', 2);
                case 's':
                    return d.getSeconds();
                case 't':
                    return d.getHours() < 12 ? 'A.M.' : 'P.M.';
            }
        }
    );

};

Date.prototype.toUTCDateTime = function () {
    var dateref = this;
    return (new Date(dateref.getUTCFullYear(), dateref.getUTCMonth(), dateref.getUTCDate(), dateref.getUTCHours(), dateref.getUTCMinutes(), dateref.getUTCSeconds(), dateref.getUTCMilliseconds()));
};
// ----------------------


// ----------------------
// String format prototype

String.prototype.format = function (args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function (item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = '{';
        } else if (intVal === -2) {
            replace = '}';
        } else {
            replace = '';
        }
        return replace;
    });
};
String.prototype.format.regex = new RegExp('{-?[0-9]+}', 'g');

// ---------------------

// ----------------------
// String padding prototype

String.prototype.padleft = function (ch, len) {
    var str = this;
    while (str.length < len) {
        str = ch + str;
    }
    return str;
};

String.prototype.padright = function (ch, len) {
    var str = this;
    while (str.length < len) {
        str = str + ch;
    }
    return str;
};
// ----------------------

module.exports.defaultDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
module.exports.nowString = function (isUTC) {
    var dateref = new Date();
    return (isUTC) ?
        dateref.toUTCDateTime().format(module.exports.defaultDateTimeFormat) :
        dateref.format(module.exports.defaultDateTimeFormat);
};
module.exports.dateString = function (dateref, isUTC) {
    return (isUTC) ?
        dateref.toUTCDateTime().format(module.exports.defaultDateTimeFormat) :
        dateref.format(module.exports.defaultDateTimeFormat);
};

module.exports.inspect = function (obj, depth) {
  return util.inspect(obj, {showHidden: false, depth: depth, colors: true});
};
module.exports.compareObjs = {
    'asc': p => { return function (a, b) { return (a[p] == b[p]) ? 0 : ((a[p] < b[p]) ? -1 : 1); } },
    'desc': p => { return function (a, b) { return (a[p] == b[p]) ? 0 : ((a[p] > b[p]) ? -1 : 1); } }
};
module.exports.ArrayMultisort = class extends Array {

    _dynamicSortMultiple() {
        var dynamicSort = function (property) {
            var _self = this;
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a, b) {
                /* next line works with strings and numbers, 
                 * and you may want to customize it to your needs
                 */
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
            }
        };

        /*
         * save the arguments object as it will be overwritten
         * note that arguments object is an array-like object
         * consisting of the names of the properties to sort by
         */
        var props = arguments;
        return function (obj1, obj2) {
            var i = 0, result = 0, numberOfProperties = props.length;
            /* try getting a different result from 0 (equal)
             * as long as we have extra properties to compare
             */
            while (result === 0 && i < numberOfProperties) {
                result = dynamicSort(props[i])(obj1, obj2);
                i++;
            }
            return result;
        }
    }

    sortBy(...args) {
        var _self = this;

        return this.sort(_self._dynamicSortMultiple.apply(null, args));
    }
};
