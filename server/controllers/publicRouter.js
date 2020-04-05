var express = require('express');
var router = express.Router();
var path = require('path');
let fs = require('fs');
var ViewsController = require('./viewsController');

var PublicController = class extends ViewsController {
    constructor() {
        super();

    }

    get viewPath() {
        let firstPath = path.join(__base, '/public/');
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
        this.getPage('public_index').then(data => {
            res.json(Models.PxaResults.ok(data.results));
        }).catch(err => {
            res.json(Models.PxaResults.err(err.results.message, err));
        });
    }

};

var routerMain = function (predixConfig, dataServiceConfig) {
    var controller = new PublicController(null, predixConfig, dataServiceConfig);

    router.route('/')
        .get(controller.index.bind(controller));

    router.route('/page/:id')
        .get(controller.page.bind(controller));

        return router;
};

module.exports = routerMain;
