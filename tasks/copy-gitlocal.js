const path = require('path');
global.__base = path.join(__dirname + '/..');
const fs = require('fs');
const ncp = require('ncp').ncp;
global.ext = require(path.join(__base, '/server/lib/extensions'));
const fsext = require(path.join(__base, '/server/lib/fsext'))();

const config = require(path.join(__base, '/server/cf.json'));

var main = async function () {
    try {

        var devprefix = process.env.devprefix;
        console.log(`developer prefix: ${devprefix}`);

        var appSettings = (config.VCAP_SERVICES.appSettings) ? config.VCAP_SERVICES.appSettings : null;
        if (appSettings === null || !appSettings["git-local"] || !appSettings["git-local"][devprefix]) throw new Error("AppSettings/git-local not found");

        var gitlocalarr = appSettings["git-local"][devprefix];
        var srclocal = path.join(__base, '/code');

        gitlocalarr.forEach(async gitlocal => {
            await fsext.clearSubfolder(gitlocal);

            ncp(srclocal, gitlocal, {clobber: true, dereference: true, stopOnErr: true}, err => {
                if (err) throw new Error(err);
                console.log("Done copying files!");
            });    
        });

    } catch (err) {
        console.log(`ERROR: ${err}`);
    }
}

main();
