var fs = require('fs');
var path = require('path');
var BaseVM = require('./BaseVM');

class FileVM extends BaseVM {
    constructor(filePath, stats) {
        super({ 
            name: path.basename(filePath), 
            filePath: filePath,
            modifiedOn: stats.mtime.format(ext.defaultDateTimeFormat),
            createdOn:  stats.ctime.format(ext.defaultDateTimeFormat),
            size: stats.size
        });

        this.exportExclusionList.push("fullName");
    }

    get size() {
        var _self = this;
        return _self.defaultValue("size", "");
    }

    // get created() {
    //     var _self = this;
    //     return _self.defaultValue("createdOn", "");
    // }

    get lastModified() {
        var _self = this;
        return _self.defaultValue("modifiedOn", "");
    }

    get fullName() {
        var _self = this;
        return _self.defaultValue("filePath", "");
    }

    get isJson() {
        var _self = this;
        return _self.name.toString().indexOf('.json') > 0;
    }

    get extension() {
        var _self = this;
        return path.extname(_self.name);
    }

    get filename() {
        var _self = this;
        return _self.name.replace(_self.extension, "");
    }
};

module.exports = FileVM;
module.exports.getFileInfo = function (filePath) {
    var stats = fs.lstatSync(filePath);
    if (!stats.isFile()) return null;
    var _file = new FileVM(filePath, stats);
    return [_file.export, filePath];
}