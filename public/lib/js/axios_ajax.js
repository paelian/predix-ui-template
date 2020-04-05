var errOut = (msg) => {
    new Noty({
        type: 'error', layout: 'bottomRight', timeout: 3000,
        text: msg
    }).show();
    console.error(msg);
};

var infoOut = (msg) => {
    new Noty({
        type: 'info', layout: 'bottomRight', timeout: 3000,
        text: msg
    }).show();
    console.info(msg);
};

var __uuidv4 = function () {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
};

// #region Ajax Blocker setup

var __ajax_queue = new Set([]);
var __ajax_blocker = new GED.BlockerControl();
var __ajax_blocker_check = function () {
    if ([...__ajax_queue.values()].length === 0) {
        __ajax_blocker.hide();
    }
    else {
        setTimeout(__ajax_blocker_check, 500);
    }
};
__ajax_blocker.on('BlockerActivated', () => {
    setTimeout(__ajax_blocker_check, 500);
});
__ajax_blocker.on('BlockerDeactivated', () => {
});

// #endregion

var ajax_get = function (url, objToEncode = null, isblocking = true) {

    var encodedObj = (objToEncode !== null) ? btoa(JSON.stringify(objToEncode)) : null;

    if (encodedObj !== null) {
        url = `${url}${(url.indexOf('?')>-1) ? '&' : '?'}encObj=${encodedObj}`;
    }

    var ajaxOptions = {
        // cache: false,
        url: url,
        method: 'get',
        headers: { contentType: "application/json; charset=utf-8" },
    };

    var uuid = { id: __uuidv4(), ajax: ajaxOptions, on: ext.nowString(true) };
    if (isblocking) {
        __ajax_queue.add(uuid);
        if (!__ajax_blocker.isOpen) {
            __ajax_blocker.show();
        }
    }

    return new Promise((resolve, reject) => {
        axios(ajaxOptions).then(results => {
            if (results && results.data && results.data.hasOwnProperty('value') && results.data.hasOwnProperty('msg') && results.data.value < 0) {
                new Noty({
                    type: 'error', layout: 'bottomRight', timeout: 3000,
                    text: results.data.msg
                }).show();
                console.error(results.data.msg);
            }
            __ajax_queue.delete(uuid);
            resolve(results.data);
        }).catch(err => {
            new Noty({
                type: 'error', layout: 'bottomRight', timeout: 3000,
                text: "** AJAX ERROR **\n" + err
            }).show();
            console.error("** AJAX ERROR ** " + err);
            __ajax_queue.delete(uuid);
            resolve({ value: -2, results: null, msg: err });
        });
    });
};

var ajax_post = function (urlPath, jsonDataParams = {}, isblocking = true) {

    var dataParams = {};
    if (jsonDataParams && typeof jsonDataParams === 'object') {
        dataParams = jsonDataParams;
    }

    var ajaxOptions = {
        // cache: false,
        url: urlPath,
        method: 'post',
        headers: { contentType: "application/json; charset=utf-8" },
        data: dataParams
    };

    var uuid = { id: __uuidv4(), ajax: ajaxOptions, on: ext.nowString(true) };
    if (isblocking) {
        __ajax_queue.add(uuid);
        if (!__ajax_blocker.isOpen) {
            __ajax_blocker.show();
        }
    }

    return new Promise((resolve, reject) => {
        axios(ajaxOptions).then(results => {
            if (results && results.data && results.data.hasOwnProperty('value') && results.data.hasOwnProperty('msg') && results.data.value < 0) {
                new Noty({
                    type: 'error', layout: 'bottomRight', timeout: 3000,
                    text: results.data.msg
                }).show();
                console.error(results.data.msg);
            }
            __ajax_queue.delete(uuid);
            resolve(results.data);
        }).catch(err => {
            new Noty({
                type: 'error', layout: 'bottomRight', timeout: 3000,
                text: "** AJAX ERROR **\n" + err
            }).show();
            console.error("** AJAX ERROR ** " + err);
            __ajax_queue.delete(uuid);
            resolve({ value: -2, results: null, msg: err });
        });
    });
};


