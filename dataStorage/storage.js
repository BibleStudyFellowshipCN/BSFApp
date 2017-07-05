import { AsyncStorage, Platform } from 'react-native';
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
        platformOS: Platform.OS
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

    // try to load from cache first
    let data = null;
    let keyString = (id == null) ? model.key : model.key + '/' + id;
    if (model.cachePolicy == CachePolicy.Memory) {
        data = global.cache[keyString];
    }
    else if (model.cachePolicy == CachePolicy.AsyncStorage) {
        data = await loadFromOffilneStorageAsync(model.key, id);
        if (data && update) {
            console.log("updating the data from cloud");
            let updatedData = await loadFromCloudAsync(model, id, /*silentLoad*/ true);
            console.log("silently save the updated cloud data to storage");
            saveToOffilneStorageAsync(updatedData, model.key, id);
        }
    }
    if (data) {
        return data;
    }

    // cache miss, load from network
    data = await loadFromCloudAsync(model, id, /*silentLoad*/ false);

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
    console.log("load from cloud: " + JSON.stringify({ model, id, silentLoad }));
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