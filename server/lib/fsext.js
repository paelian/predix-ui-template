var path = require("path");
var fs = require('fs');

module.exports = function () {
    return {
        isDirectory: function (source) { return fs.lstatSync(source).isDirectory() },
        isFile: function (source) { return fs.lstatSync(source).isFile() },
        getSubfolders: function (source) { return fs.readdirSync(source).map(name => path.join(source, name)).filter(this.isDirectory) },
        getSubfiles: function (source) { return fs.readdirSync(source).map(name => path.join(source, name)).filter(this.isFile) },
        clearSubfolder: async function (source, excludeArr, processSubfolders = false, deleteSubfolders = true) {
            let files = (excludeArr && Array.isArray(excludeArr)) ? fs.readdirSync(source).map(name => path.join(source, name)).filter(this.isFile).filter(file => !excludeArr.includes(path.basename(file))) : fs.readdirSync(source).map(name => path.join(source, name)).filter(this.isFile);
            let folders = fs.readdirSync(source).map(name => path.join(source, name)).filter(this.isDirectory);

            folders.forEach(folder => {
                if (deleteSubfolders) {
                    this.deleteFolderRecursive(folder);
                } else {
                    if (processSubfolders) {
                        this.clearSubfolder(source, excludeArr, true, false);
                    }
                }
            });
            for (const file of files) {
                console.log(`Removing file ${file}...`);
                fs.unlinkSync(file);
            }
        },
        deleteFolderRecursive: function (path) {
            var _self = this;
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function (file, index) {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        _self.deleteFolderRecursive(curPath);
                    } else { // delete file
                        console.log(`Removing file ${curPath}...`);
                        fs.unlinkSync(curPath);
                    }
                });
                console.log(`Removing path ${path}...`);
                fs.rmdirSync(path);
            }
        }
    };
}