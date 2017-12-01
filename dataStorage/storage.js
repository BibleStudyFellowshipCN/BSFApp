import { Alert, AsyncStorage, Platform } from 'react-native';
import { debounce } from 'lodash';
import Storage from 'react-native-storage';
import { Constants } from 'expo';
import { Models, CachePolicy } from './models';
import { getCurrentUser } from '../store/user';

if (!global.storage) {
    global.storage = new Storage({
        size: 100000,
        storageBackend: AsyncStorage,
        enableCache: true,
        defaultExpires: null,
    });
}

const storage = global.storage;

if (!global.cache) {
    global.cache = [];
}

if (!global.deviceInfo) {
    global.deviceInfo = {
        deviceId: Constants['deviceId'],
        sessionId: Constants['sessionId'],
        deviceYearClass: Constants['deviceYearClass'],
        platformOS: Platform.OS,
        version: Constants.manifest.version
    };
}

function getLanguage() {
    let lang = getCurrentUser().getLanguage();
    if (!lang) {
        lang = Models.DefaultLanguage;
    }
    return lang;
}

function encode(idOrKey) {
    // key and id can never contains "_"
    return idOrKey.replace(/_/g, '##-##');
}

function getFromCache(key, keyString) {
    let cache;
    // Load from book/lesson cache
    if (key == Models.Lesson.key || key == Models.Book.key) {
        switch (getCurrentUser().getLanguage()) {
            case 'chs':
                cache = require("./chs.json");
                break;
            case 'cht':
                cache = require("./cht.json");
                break;
            case 'eng':
                cache = require("./eng.json");
                break;
            case 'spa':
                cache = require("./spa.json");
                break;
        }
        if (cache[keyString]) {
            console.log("[Book/Lesson] Hit from cache");
            return cache[keyString];
        }
    }

    // Load from passage cache
    if (key == Models.Passage.key) {
        switch (getCurrentUser().getBibleVersion()) {
            case 'ccb':
                cache = require("./ccb.json");
                break;
            case 'cnvt':
                cache = require("./cnvt.json");
                break;
            case 'esv':
                cache = require("./esv.json");
                break;
            case 'kjv':
                cache = require("./kjv.json");
                break;
            case 'niv1984':
                cache = require("./niv1984.json");
                break;
            case 'niv2011':
                cache = require("./niv2011.json");
                break;
            case 'nvi':
                cache = require("./nvi.json");
                break;
            case 'rcuvss':
                cache = require("./rcuvss.json");
                break;
            case 'rcuvts':
                cache = require("./rcuvts.json");
                break;
            case 'rvr1995':
                cache = require("./rvr1995.json");
                break;
        }
        if (cache[keyString]) {
            console.log("[Passage] Hit from cache");
            return cache[keyString];
        }
    }

    return null;
}

async function pokeServer(message) {
    console.log('>Poke:' + message);
    let noCacheHeader = new Headers();
    noCacheHeader.append('pragma', 'no-cache');
    noCacheHeader.append('cache-control', 'no-cache');
    noCacheHeader.append('deviceId', global.deviceInfo.deviceId);
    noCacheHeader.append('sessionId', global.deviceInfo.sessionId);
    noCacheHeader.append('deviceYearClass', global.deviceInfo.deviceYearClass);
    noCacheHeader.append('platformOS', global.deviceInfo.platformOS);
    noCacheHeader.append('version', global.deviceInfo.version);
    noCacheHeader.append('data', message);

    fetch(Models.Poke.restUri, { method: 'POST', headers: noCacheHeader })
        .then((response) => {
            console.log('>' + response.status);
        })
        .catch((error) => {
            console.log(error);
        });
}

async function loadAsync(model, id, update) {
    if (!model) {
        throw "key is not defined";
    }

    console.log("start load " + JSON.stringify({ model, id }));

    if (model.useLanguage) {
        if (id.indexOf('?') == -1) {
            id = id + '?lang=' + getLanguage();
        } else {
            id = id + '&lang=' + getLanguage();
        }
    }

    let keyString = (id == null) ? model.key : model.key + '/' + id;

    // load from cache first
    if (model.restUri) {
        pokeServer(keyString);
        let data = getFromCache(model.key, keyString);
        if (data) {
            return data;
        }
    }

    // load from network first
    let data = await loadFromCloudAsync(model, id, /*silentLoad*/ true);

    // store to cache
    if (data) {
        if (model.cachePolicy == CachePolicy.Memory) {
            global.cache[keyString] = data;
        }
        else if (model.cachePolicy == CachePolicy.AsyncStorage) {
            saveToOffilneStorageAsync(data, model.key, id);
        }
        console.log("finish load " + JSON.stringify({ model, id }));
    }
    else {
        console.log("failed to load" + JSON.stringify({ model, id }));

        // then try to load from cache
        if (model.cachePolicy == CachePolicy.Memory) {
            data = global.cache[keyString];
        }
        else if (model.cachePolicy == CachePolicy.AsyncStorage) {
            data = await loadFromOffilneStorageAsync(model.key, id);
        }
    }

    return data;
}

async function loadFromOffilneStorageAsync(key, id) {
    console.log("load from storage: " + JSON.stringify({ key, id }));
    try {
        const data = !!id ?
            await storage.load({ key: encode(key), id: encode(id) }) :
            await storage.load({ key: encode(key) });
        return data;
    } catch (err) {
        console.log("failed to load from storage: " + JSON.stringify({ key, id }));
        return null;
    }
}

async function loadFromCloudAsync(model, id, silentLoad) {
    if (!model.restUri) {
        // The model deosn't support online fetch
        return null;
    }
    console.log("load from cloud: " + JSON.stringify({ model, id, silentLoad, deviceInfo: global.deviceInfo }));
    const url = !!id ? (model.restUri + '/' + id) : model.restUri;
    let responseJson;
    try {
        // Set no cache header
        let noCacheHeader = new Headers();
        noCacheHeader.append('pragma', 'no-cache');
        noCacheHeader.append('cache-control', 'no-cache');
        noCacheHeader.append('deviceId', global.deviceInfo.deviceId);
        noCacheHeader.append('sessionId', global.deviceInfo.sessionId);
        noCacheHeader.append('deviceYearClass', global.deviceInfo.deviceYearClass);
        noCacheHeader.append('platformOS', global.deviceInfo.platformOS);
        noCacheHeader.append('version', global.deviceInfo.version);

        // fetch data from service
        const response = await fetch(url, { method: 'GET', headers: noCacheHeader });

        try {
            // FIXME: [Wei] "response.json()" triggers error on Android
            let responseString = await response.text();
            responseJson = JSON.parse(responseString);
        } catch (err) {
            // Fallback to eval workaround if JSON.parse() doesn't work
            responseJson = eval("(" + response._bodyText + ")")
        }

        if (responseJson == undefined) {
            alert("Invalid server response");
            return null;
        }

        if (responseJson.error != undefined) {
            console.log(responseJson.error);
            alert(responseJson.error);
            return null;
        }

        console.log(url + " => " + JSON.stringify(responseJson));
    } catch (err) {
        console.log(err);
        if (!silentLoad) {
            alert(err, "Failed to get data from network, check your network connection.");
        }
    }

    return responseJson;
}

const debouncedSaveToCloud = debounce(saveToCloud, wait = 500)

async function saveAsync(data, model, id) {
    if (!model) {
        throw "model is not defined";
    }

    await saveToOffilneStorageAsync(data, model.key, id);
    debouncedSaveToCloud(data, model, id);
}

async function saveToOffilneStorageAsync(payload, key, id) {
    console.log("save to storage: " + JSON.stringify({ key, id }));
    return !!id ?
        await storage.save({ key: encode(key), id: encode(id), rawData: payload }) :
        await storage.save({ key: encode(key), rawData: payload })
}

function saveToCloud(data, model, id) {
    // TODO
}


async function clearStorageAsync(key) {
    key = encode(key);
    console.log("clearStorageAsync: " + key);
    await storage.clearMapForKey(key);
}

async function callWebServiceAsync(url, api, method, headers, body) {
    let responseStatus;
    let responseHeader;
    let responseJson;
    let serverUrl = url + api;
    try {
        // Set no cache header
        let httpHeaders = new Headers();
        httpHeaders.append('pragma', 'no-cache');
        httpHeaders.append('cache-control', 'no-cache');
        httpHeaders.append('Content-type', 'application/json');
        httpHeaders.append('Accept', 'application/json');
        httpHeaders.append('deviceId', global.deviceInfo.deviceId);
        httpHeaders.append('sessionId', global.deviceInfo.sessionId);
        httpHeaders.append('deviceYearClass', global.deviceInfo.deviceYearClass);
        httpHeaders.append('platformOS', global.deviceInfo.platformOS);
        if (headers) {
            headers.forEach(function (item) {
                httpHeaders.append(item.name, item.value);
            });
        }

        let payload;
        if (body) {
            payload = { method, headers: httpHeaders, body: JSON.stringify(body) };
        } else {
            payload = { method, headers: httpHeaders };
        }

        console.log(JSON.stringify({ url: serverUrl, ...payload }));
        const response = await fetch(serverUrl, payload);

        responseStatus = response.status;
        responseHeader = response.headers.map;

        try {
            let responseString = await response.text();
            responseJson = JSON.parse(responseString);
        } catch (err) {
            if (response._bodyText) {
                responseJson = eval("(" + response._bodyText + ")")
            }
        }

        if (!responseJson) {
            responseJson = '';
        }

    } catch (err) {
        console.log('callWebServiceAsync Error:' + JSON.stringify(err));
    }

    const result = { headers: responseHeader, body: responseJson, status: responseStatus };
    console.log(method + ' ' + serverUrl + " => " + JSON.stringify(result));
    return result;
}

async function showWebServiceCallErrorsAsync(result, acceptStatus) {
    if (!result) {
        await Alert.alert('Error', 'Please check your network connection');
    }
    else if (acceptStatus) {
        if (result.status == acceptStatus) {
            return true;
        } else {
            let message = 'HTTP status ' + result.status;
            if (result.body) {
                if (result.body.Message) {
                    message = message + "\n\n" + result.body.Message;
                }
                if (result.body.ExceptionMessage) {
                    message = message + "\n\n" + result.body.ExceptionMessage;
                }
                if (result.body.ExceptionType) {
                    message = message + "\n\n" + result.body.ExceptionType;
                }
            }
            await Alert.alert('Error', message);
        }
    }

    return false;
}

export { loadAsync, saveAsync, clearStorageAsync, callWebServiceAsync, showWebServiceCallErrorsAsync };