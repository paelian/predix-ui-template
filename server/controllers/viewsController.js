var express = require('express');
var router = express.Router();
var BaseController = require('./baseController');
var path = require('path');
let fs = require('fs');
var fsext = require(path.join(__base, '/server/lib/fsext'))();

var UserService = require(path.join(__base, './server/services/userService'));

var loadSQL = (sqlpath) => {
    let filelist = fsext.getSubfiles(sqlpath);
    let sqlfiles = new Map();
    let rtn = {};
    for(let filepath of filelist) {
        let file = fs.readFileSync(filepath);    
        sqlfiles.set(path.basename(filepath).toLowerCase().replace('.sql',''), file.toString());
    }
    rtn['queries'] = sqlfiles;
    let folderlist = fsext.getSubfolders(sqlpath);
    for(let fldr of folderlist) {
        rtn[path.basename(fldr)] = loadSQL(fldr);
    }

    return rtn;
};

const sqlLibPath = path.join(__base, '/server/sql');


var ViewsController = class extends BaseController {
    constructor() {
        super();

        this._usersvc = null;

        this._sqlmap = loadSQL(sqlLibPath);

    }

    init(req) {
        var _self = this;
        let jwtdata = req.session.pauc_token;
        _self._usersvc = new UserService(jwtdata);  
    }

    getUserInfo(req, res, next) {
        var _self = this;
        _self.init(req);
        res.json(Models.PxaResults.ok({ userInfo: _self._usersvc.userInfo }));
    }

    get viewPath() {
        let firstPath = path.join(__base, '/server/views/', this.constructor.name.replace('Controller',''));
        // can do some folder existence checking here to search for the 'right' path to use, like ASP.NET does...for now, just return and assume it exists
        return firstPath;
    }

    getPage(pageName) {
        let _page = (pageName) ? pageName : 'index';
        return new Promise((resolve, reject) => {
            var htmlpage = path.join(this.viewPath, pageName + '.html');

            fs.readFile(htmlpage, 'utf8', function (err, data) {
                if (err) {
                    reject({ status: 500, results: err });
                } else {
                    resolve({ status: 200, results: data });
                }
            });
        });
    }

    index(req, res, next) {        
        if (this._usersvc === null) this.init(req);
        this.getPage('index').then(data => {
            res.json(Models.PxaResults.ok(data.results));
        }).catch(err => {
            res.json(Models.PxaResults.err(err.results.message, err));
        });
    }

    page(req, res, next) {
        if (this._usersvc === null) this.init(req);
        let id = (req.params.id) ? req.params.id : 'index';
        this.getPage(id).then(data => {
            res.json(Models.PxaResults.ok(data.results));
        }).catch(err => {
            res.json(Models.PxaResults.err(err.results.message, err));
        });        
    }
    
};

module.exports = ViewsController;
