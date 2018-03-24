import { Alert, AsyncStorage, Platform } from 'react-native';
import { debounce } from 'lodash';
import Storage from 'react-native-storage';
import { Constants, FileSystem } from 'expo';
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

if (!global.deviceInfo) {
    global.deviceInfo = {
        deviceId: Constants['deviceId'],
        sessionId: Constants['sessionId'],
        deviceYearClass: Constants['deviceYearClass'],
        platformOS: Platform.OS,
        version: Constants.manifest.version,
        sdkVersion: 'SDK' + Constants.manifest.sdkVersion
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

global_cache = [];
async function reloadGlobalCache(name) {
    console.log("reloadGlobalCache: " + name);
    try {
        const localUri = FileSystem.documentDirectory + name + '.json';
        var data = await FileSystem.readAsStringAsync(localUri);
        global_cache[name] = JSON.parse(data);
    } catch (e) {
        global_cache[name] = [];
        console.log(e);
    }
}

async function getCacheData(name, key) {
    if (!global_cache[name]) {
        await reloadGlobalCache(name);
    }
    if (global_cache[name]) {
        const data = global_cache[name][key];
        if (data) {
            console.log("Load from global cache:" + name + ':' + key);
            return data;
        }
    }

    // If fails to get from downloaded cache, return the default ones
    let cache;
    switch (name) {
        case 'books':
            cache = require("../assets/json/books.json");
            break;
        case 'chs':
            cache = require("../assets/json/chs.json");
            break;
        case 'cht':
            cache = require("../assets/json/cht.json");
            break;
        case 'eng':
            cache = require("../assets/json/eng.json");
            break;
        case 'spa':
            cache = require("../assets/json/spa.json");
            break;
        case 'ccb':
            cache = require("../assets/json/ccb.json");
            break;
        case 'cnvt':
            cache = require("../assets/json/cnvt.json");
            break;
        case 'esv':
            cache = require("../assets/json/esv.json");
            break;
        case 'kjv':
            cache = require("../assets/json/kjv.json");
            break;
        case 'nivavd1984':
            cache = require("../assets/json/niv1984.json");
            break;
        case 'niv2011':
            cache = require("../assets/json/niv2011.json");
            break;
        case 'nvi':
            cache = require("../assets/json/nvi.json");
            break;
        case 'rcuvss':
            cache = require("../assets/json/rcuvss.json");
            break;
        case 'rcuvts':
            cache = require("../assets/json/rcuvts.json");
            break;
        case 'rvr1995':
            cache = require("../assets/json/rvr1995.json");
            break;
        case 'homeDiscussion':
            cache = require("../assets/json/homeDiscussion.json");
            break;
        case 'homeTraining':
            cache = require("../assets/json/homeTraining.json");
            break;
    }
    if (cache) {
        const data = cache[key];
        if (data) {
            console.log("Load from local cache:" + name + ':' + key);
            return data;
        }
    }

    console.log("No cache hit for " + name + ':' + key);
    return null;
}

async function getFromCache(key, keyString) {
    // Load from book cache
    if (key == Models.Book.key) {
        const data = await getCacheData('books', getCurrentUser().getLanguage());
        if (data) {
            return data;
        }
    }

    // Load from lesson cache
    if (key == Models.Lesson.key) {
        const data = await getCacheData(getCurrentUser().getLanguage(), keyString);
        if (data) {
            return data;
        }
    }

    // Load from passage cache
    if (key == Models.Passage.key) {
        const data = await getCacheData(getCurrentUser().getBibleVersion(), keyString);
        if (data) {
            return data;
        }
    }

    return null;
}

function getHttpHeaders() {
    return {
        'pragma': 'no-cache',
        'cache-control': 'no-cache',
        'deviceId': global.deviceInfo.deviceId,
        'sessionId': global.deviceInfo.sessionId,
        'deviceYearClass': global.deviceInfo.deviceYearClass,
        'platformOS': global.deviceInfo.platformOS,
        'version': global.deviceInfo.version + ' ' + global.deviceInfo.sdkVersion,
        'lang': getCurrentUser().getLanguage(),
        'bibleVersion': getCurrentUser().getBibleVersion(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
}

let lastPokeDay = 0;

async function pokeServer(model, id) {
    // Don't poke from non-device
    /*if (!Expo.Constants.isDevice) {
        return;
    }*/

    // Check is done daily
    const dayOfToday = (new Date()).getDate();
    console.log('LastCheckForPokeDate: ' + lastPokeDay + ' DayOfToday: ' + dayOfToday);
    if (dayOfToday == lastPokeDay) {
        return;
    }

    getCurrentUser().checkForUpdate(true);

    lastPokeDay = dayOfToday;
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
        let data = await getFromCache(model.key, keyString);
        if (data) {
            return data;
        }
    }

    // load from network first
    let data = await loadFromCloudAsync(model, id, /*silentLoad*/ true);

    // store to cache
    if (data) {
        if (model.cachePolicy == CachePolicy.AsyncStorage) {
            saveToOffilneStorageAsync(data, model.key, id);
        }
        console.log("finish load " + JSON.stringify({ model, id }));
    }
    else {
        console.log("failed to load" + JSON.stringify({ model, id }));

        // then try to load from cache
        if (model.cachePolicy == CachePolicy.AsyncStorage) {
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
        // fetch data from service
        const response = await fetch(url, { method: 'GET', headers: getHttpHeaders() });

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

async function loadFromCacheAsync(file, id) {
    return await getCacheData(file, getLanguage() + '/' + id);
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

async function callWebServiceAsync(url, api, method, headersUnused, body) {
    let responseStatus;
    let responseHeader;
    let responseJson;
    let serverUrl = url + api;
    const headers = getHttpHeaders();
    try {
        let payload;
        if (body) {
            payload = { method, headers, body: JSON.stringify(body) };
        } else {
            payload = { method, headers };
        }

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
    console.log(method + ' ' + serverUrl + " >>> " + JSON.stringify({ headers, body }));
    console.log(method + ' ' + serverUrl + " <<< " + JSON.stringify(result));
    return result;
}

async function showWebServiceCallErrorsAsync(result, acceptStatus, showUI = true) {
    if (!result || !result.status) {
        if (showUI) {
            await Alert.alert('Error', 'Please check your network connection');
        }
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
            if (showUI) {
                await Alert.alert('Error', message);
            }
        }
        return false;
    }

    return true;
}

export { loadAsync, saveAsync, clearStorageAsync, callWebServiceAsync, showWebServiceCallErrorsAsync, pokeServer, reloadGlobalCache, loadFromCacheAsync };