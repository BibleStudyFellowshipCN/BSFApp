import { AsyncStorage } from 'react-native';
import { debounce } from 'lodash';
import Storage from 'react-native-storage';

import { Models, CachePolicy } from './models';

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

function encode(idOrKey) {
    // key and id can never contains "_"
    return idOrKey.replace(/_/g, '##-##');
}

async function loadAsync(model, id) {
    if (!model) {
        throw "key is not defined";
    }

    console.log("start load " + JSON.stringify({model, id}));
    
    // try to load from cache first
    let data = null;
    let keyString = (id == null)? model.key: model.key + id;    
    if (model.cachePolicy == CachePolicy.Memory) {
        data = global.cache[keyString];
    }
    else if (model.cachePolicy == CachePolicy.AsyncStorage) {
        data = await loadFromOffilneStorageAsync(model.key, id);
    }    
    if (data) {
        return data
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
    }
    console.log("finish load " + JSON.stringify({model, id}));
    return data;
}

async function loadFromOffilneStorageAsync(key, id) {
    console.log("load from storage: " + JSON.stringify({key, id}));
    try {
        const data = !!id ?
            await storage.load({ key: encode(key), id: encode(id) }) :
            await storage.load({ key: encode(key) });
        return data;
    } catch (err) {
        console.log("failed to load from storage: " + JSON.stringify({key, id}));
        return null;
    }
}

async function loadFromCloudAsync(model, id, silentLoad) {
    if (!model.restUri) {
        // The model deosn't support online fetch
        return null;
    }
    console.log("load from cloud: " + JSON.stringify({model, id, silentLoad}));
    const url = !!id ? (model.restUri + id) : model.restUri;
    let responseJson;
    try {
        // Set no cache header
        let noCacheHeader = new Headers();
        noCacheHeader.append('pragma', 'no-cache');
        noCacheHeader.append('cache-control', 'no-cache');

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
    console.log("save to storage: " + JSON.stringify({key, id}));
    return !!id ?
        await storage.save({ key: encode(key), id: encode(id), rawData: payload }) :
        await storage.save({ key: encode(key), rawData: payload })
}

function saveToCloud(data, model, id) {
    // TODO
}


async function clearStorageAsync(key) {
    if (key) {
        await storage.clearMapForKey(key);
    }
    else {
        await storage.clearMap();
    }
}

export { loadAsync, saveAsync, clearStorageAsync };