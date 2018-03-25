(function (global, undefined) {

'use strict';

var getXHR = global.ActiveXObject ? function () {
    return new global.ActiveXObject('Microsoft.XMLHTTP');
} : global.XMLHttpRequest ? function () {
    return new global.XMLHttpRequest();
} : function () {
    throw 'Your browser doesn\'t support AJAX requests.';
};

var parseJSON = global.JSON ? function (string) {
    return global.JSON.parse(string);
} : function (string) {
    return global.eval('(' + string + ')');
};

var parseXML = global.DOMParser ? function (string) {
    return new global.DOMParser().parseFromString(string, 'text/xml');
} : global.ActiveXObject ? function (string) {
    var doc = new global.ActiveXObject('Microsoft.XMLDOM');
    doc.loadXML(string);
    return doc;
} : function (string) {
    throw 'Your browser doesn\'t support XML parsing.';
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
if (!global.String.prototype.trim) {
    global.String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Date/now#Proth%C3%A8se_d'%C3%A9mulation_(polyfill)
if (!global.Date.now) {
    global.Date.now = function () {
        return new global.Date().getTime();
    };
}

function each (object, callback) {

    for (var i in object)
        if (object.hasOwnProperty(i))
            if (callback(i, object[i]) === false)
                break;
}

function extend (original, by) {

    var object = {};

    each(original, function (key, value) {
        object[key] = value;
    });

    each(by, function (key, value) {
        object[key] = value;
    });

    return object;
}

function clone (object) {

    return extend({}, object);
}

function endPromise (xhr, params, resolve, reject) {

    xhr = digestXHR(xhr, params);

    (200 <= xhr.status && xhr.status <= 206) || xhr.status === 304 ?
        resolve(xhr) : reject(xhr);
}

function digestResponse (responseText, headers, params) {

    var type = params.responseType;

    if (type === 'auto') {

        if (headers['Content-Type']) {

            var ref = {
                'json': /^(?:text|application)\/json(?:;.+)?$/,
                'xml': /^(?:text|application)\/xml(?:;.+)?$/
            };

            each(ref, function (key, regex) {
                if (regex.test(headers['Content-Type'])) {
                    type = key;
                    return false;
                }
            });

            // If no matching on Content-Type has been found
            if (type === 'auto') type = 'text';
        }

        else type = 'text';
    }

    // Then we are sure to have an explicit value as type
    switch (type) {
        case 'text': return responseText;
        case 'json': return parseJSON(responseText);
        case 'xml' : return parseXML(responseText);
    }
}

function digestHeaders (rawHeaders) {

    rawHeaders = rawHeaders.split(/\r\n/);

    var headers = {};
    for (var i = 0; i < rawHeaders.length; i++) {

        var sepIndex = rawHeaders[i].indexOf(':');

        if (sepIndex !== -1) { // Avoid empty item or incorrect item at the end of the split

            var headerName = rawHeaders[i]
                .substring(0, sepIndex)
                .trim()
                .replace(/(^.)|(-.)/g, function ($0, $1, $2) {
                    return ($1 || $2).toUpperCase();
                });

            var headerValue = rawHeaders[i]
                .substring(sepIndex + 1)
                .trim();

            headers[ headerName ] = headerValue;
        }
    }

    return headers;
}

function digestXHR (xhr, params) {

    var headers = digestHeaders(xhr.getAllResponseHeaders());
    var response = digestResponse(xhr.responseText, headers, params);

    return {
        status: xhr.status,
        responseText: xhr.responseText,
        response: response,
        responseHeaders: headers
    };
}

function XHR (params) {

    params = extend(XHR.defaultParams, params);

    // Avoid altering external references
    params.headers = clone(params.headers);
    params.headers['Content-Type'] = params.contentType + '; charset=' + params.charset;

    if (!params.cache) {

        // Avoid storing response along the network
        params.headers['Cache-Control'] = 'no-cache, no-store';

        // Trick browser to force it not to use its cache
        var nocache = '';
        do { nocache += '_'; }
        while (new global.RegExp('[?&]' + nocache + '=').test(params.url));

        params.url += (params.url.indexOf('?') !== -1 ? '&' : '?') + nocache + '=' + global.Date.now();
    }

    // Serialize data if provided as object
    if (typeof params.data === 'object'){

        var data = [];
        each(params.data, function (name, value) {
            data.push(global.encodeURIComponent(name) + '=' + global.encodeURIComponent(value));
        });

        params.data = data.join('&');
    }

    return Promise.exec(function (resolve, reject, notify) {

        var xhr = getXHR();

        // Bind listener before calling xhr.open since IE prevents it to be set after the call
        if (params.async)
            xhr.onreadystatechange = function () {
                notify(xhr.readyState);
                if (xhr.readyState === 4)
                    endPromise(xhr, params, resolve, reject);
            };

        xhr.open(params.method, params.url, params.async, params.user, params.password);
        each(params.headers, function (name, value) {
            xhr.setRequestHeader(name, value);
        });
        xhr.send(params.data);

        // Synchronous mode
        if (!params.async)
            endPromise(xhr, params, resolve, reject);
    });
}

XHR.defaultParams = {

    url: undefined,
    // GET, POST, HEAD, PUT, DELETE etc..
    method: 'GET',

    user: undefined,
    password: undefined,

    // 'auto' : response is parsed according to the Content-Type response header or text if no header
    // 'text' : no parsing is done
    // 'json' : response is parsed as a json string
    responseType: 'auto',
    async: true,

    contentType: 'application/x-www-form-urlencoded',
    charset: 'UTF-8',

    headers: {},
    data: null,

    // false: force always asking to the server (appending a random seed in the URL) + do not store response in cache
    cache: true
};

XHR.noConflict = function () {
    global.XHR = XHR.conflicted;
    return XHR;
};

XHR.conflicted = global.XHR;
global.XHR = XHR;

})(this);
